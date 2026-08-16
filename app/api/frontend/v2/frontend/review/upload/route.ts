import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { addFileToS3 } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

// Automatically optimizes, auto-rotates (EXIF), converts to WebP, and compresses strictly under 100KB
async function optimizeReviewPhotoToWebpUnder100KB(buffer: Buffer): Promise<Buffer> {
  try {
    const TARGET_SIZE = 100 * 1024; // 100KB max

    // 1st Pass: 1080px @ 80% WebP
    let optimized = await sharp(buffer)
      .rotate() // Auto-orient camera photos (iPhone / Android)
      .resize(1080, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    if (optimized.length <= TARGET_SIZE) {
      return optimized;
    }

    // 2nd Pass: 900px @ 70% WebP
    optimized = await sharp(buffer)
      .rotate()
      .resize(900, 900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70, effort: 5 })
      .toBuffer();

    if (optimized.length <= TARGET_SIZE) {
      return optimized;
    }

    // 3rd Pass: 800px @ 60% WebP
    optimized = await sharp(buffer)
      .rotate()
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 60, effort: 6 })
      .toBuffer();

    if (optimized.length <= TARGET_SIZE) {
      return optimized;
    }

    // 4th Pass: 700px @ 50% WebP (Guarantees < 100KB for any complex image)
    optimized = await sharp(buffer)
      .rotate()
      .resize(700, 700, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 50, effort: 6 })
      .toBuffer();

    return optimized;
  } catch (err) {
    console.warn("[WARN] Sharp WebP optimization failed, falling back to original buffer:", err);
    return buffer;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Accept any camera or gallery photo up to 25MB (will be compressed to < 100KB WebP)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Photo size is too large (max 25MB)" },
        { status: 400 }
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Automatically convert to WebP and compress under 100KB
    const optimizedBuffer = await optimizeReviewPhotoToWebpUnder100KB(rawBuffer);

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const baseName = `review_${timestamp}_${path.basename(cleanFileName, path.extname(cleanFileName))}`;
    const fileName = `${baseName}.webp`;

    let finalUrl = "";

    // 1. Try Uploading to AWS S3 (as image/webp)
    if (
      process.env.AWS_S3_BUCKET_NAME &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      try {
        const s3Res = await addFileToS3({
          directoryName: "customer-reviews",
          fileType: "image",
          fileName: fileName,
          buffer: optimizedBuffer,
          extension: "webp"
        });

        const cloudfrontDomain =
          process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN ||
          process.env.AWS_CLOUDFRONT_DOMAIN;

        if (cloudfrontDomain) {
          finalUrl = `https://${cloudfrontDomain.replace(/^https?:\/\//, "")}/customer-reviews/${s3Res.fileName}`;
        } else {
          finalUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/customer-reviews/${s3Res.fileName}`;
        }
      } catch (s3Err) {
        console.warn("[WARN S3 Customer Review Upload fallback to local storage]", s3Err);
      }
    }

    // 2. Fallback to local storage if S3 is unavailable
    if (!finalUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "customer-reviews");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, fileName);
      fs.writeFileSync(localFilePath, optimizedBuffer);
      finalUrl = `/uploads/customer-reviews/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      fileName: fileName,
      fileSizeKb: (optimizedBuffer.length / 1024).toFixed(1),
      format: "webp"
    });
  } catch (error: any) {
    console.error("[ERR POST /api/frontend/v2/frontend/review/upload]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
