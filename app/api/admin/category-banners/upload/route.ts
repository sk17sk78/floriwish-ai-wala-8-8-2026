import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { addFileToS3 } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "desktop"; // "desktop" | "mobile"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || (type === "desktop" ? 1200 : 480);
    const height = metadata.height || (type === "desktop" ? 400 : 240);

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `banner_${type}_${timestamp}_${cleanFileName}`;
    const ext = path.extname(cleanFileName).replace(".", "").toLowerCase() || "jpg";

    let finalUrl = "";

    // Try AWS S3 if credentials exist
    if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const s3Res = await addFileToS3({
          directoryName: "banners",
          fileType: "image",
          fileName: fileName,
          buffer,
          extension: ext
        });

        const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || process.env.AWS_CLOUDFRONT_DOMAIN;
        if (cloudfrontDomain) {
          finalUrl = `https://${cloudfrontDomain.replace(/^https?:\/\//, "")}/banners/${s3Res.fileName}`;
        } else {
          finalUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/banners/${s3Res.fileName}`;
        }
      } catch (s3Err) {
        console.warn("[WARN S3 Upload failed, using local public fallback]", s3Err);
      }
    }

    // Local filesystem fallback if not S3
    if (!finalUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, `${fileName}.${ext === "webp" ? "webp" : ext}`);
      fs.writeFileSync(localFilePath, buffer);
      finalUrl = `/uploads/banners/${fileName}.${ext === "webp" ? "webp" : ext}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        url: finalUrl,
        width,
        height,
        alt: cleanFileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ")
      }
    });
  } catch (error: any) {
    console.error("[ERR Banner Upload API]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
