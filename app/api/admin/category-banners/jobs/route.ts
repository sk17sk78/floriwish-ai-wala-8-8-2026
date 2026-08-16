import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { del as delFromRedis } from "@/db/redis/methods";
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { CategoryBannerJobs } = models;

    const jobs = await CategoryBannerJobs.find().sort({ createdAt: -1 }).limit(30).lean();
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { CategoryBannerJobs, GlobalCategoryBanners, ContentCategories } = models;

    const body = await req.json();
    const { bannerId, type = "BULK_APPLY", batchSize = 50, adminName = "Admin" } = body;

    const banner = await GlobalCategoryBanners.findById(bannerId);
    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner campaign not found." }, { status: 404 });
    }

    let targetCategories: any[] = [];
    if (banner.allCategories) {
      targetCategories = await ContentCategories.find({ isActive: true }).select("name slug _id").lean();
    } else {
      targetCategories = banner.appliedCategories || [];
    }

    const totalCategories = targetCategories.length;
    const totalBatches = Math.ceil(totalCategories / batchSize);

    const job = await CategoryBannerJobs.create({
      bannerId: banner._id,
      bannerTitle: banner.title,
      type,
      status: "processing",
      totalCategories,
      processedCategories: 0,
      batchSize,
      currentBatch: 0,
      totalBatches,
      failedCategories: [],
      initiatedBy: adminName,
      startedAt: new Date(),
      logs: [
        {
          timestamp: new Date(),
          message: `Job started for banner '${banner.title}'. Total categories: ${totalCategories} in ${totalBatches} batches.`,
          level: "info"
        }
      ]
    });

    // Execute batches asynchronously in the background so request completes immediately with job ID
    (async () => {
      try {
        let processed = 0;
        const failed: string[] = [];

        for (let i = 0; i < totalCategories; i += batchSize) {
          // Check if job was cancelled
          const currentJobState = await CategoryBannerJobs.findById(job._id).select("status");
          if (currentJobState?.status === "cancelled") {
            console.log(`[Job ${job._id}] was cancelled by user.`);
            return;
          }

          const batch = targetCategories.slice(i, i + batchSize);
          const currentBatchNum = Math.floor(i / batchSize) + 1;

          try {
            // Purge Redis cache for this batch
            const keysToDel = batch.flatMap((c: any) => [
              `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${c.slug}`,
              `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${c.slug}`
            ]);

            await delFromRedis({ keys: keysToDel }).catch(() => {});
            processed += batch.length;

            await CategoryBannerJobs.findByIdAndUpdate(job._id, {
              processedCategories: processed,
              currentBatch: currentBatchNum,
              $push: {
                logs: {
                  timestamp: new Date(),
                  message: `Batch ${currentBatchNum}/${totalBatches} complete (${processed}/${totalCategories} categories synchronized).`,
                  level: "info"
                }
              }
            });

            // Small gentle yield (15ms) to keep event loop free
            await new Promise((resolve) => setTimeout(resolve, 20));
          } catch (batchErr: any) {
            console.error(`[Job ${job._id}] Batch Error:`, batchErr);
            batch.forEach((c: any) => failed.push(c.slug || String(c._id)));
          }
        }

        await CategoryBannerJobs.findByIdAndUpdate(job._id, {
          status: failed.length > 0 ? (failed.length === totalCategories ? "failed" : "completed") : "completed",
          processedCategories: processed,
          failedCategories: failed,
          completedAt: new Date(),
          $push: {
            logs: {
              timestamp: new Date(),
              message: `Job finished successfully! Total ${processed} categories processed, ${failed.length} failed.`,
              level: failed.length > 0 ? "warn" : "info"
            }
          }
        });
      } catch (err: any) {
        console.error(`[Job ${job._id}] Unhandled error:`, err);
        await CategoryBannerJobs.findByIdAndUpdate(job._id, {
          status: "failed",
          errorMessage: err.message || "Unknown error",
          completedAt: new Date()
        });
      }
    })().catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Bulk background job initiated successfully!",
      jobId: String(job._id),
      job
    });
  } catch (error: any) {
    console.error("[ERR POST /api/admin/category-banners/jobs]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
