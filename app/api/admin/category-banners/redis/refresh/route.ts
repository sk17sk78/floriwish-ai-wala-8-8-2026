import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { del as delFromRedis } from "@/db/redis/methods";
import {
  CONTENT_CATEGORY_PAGE_CACHE_KEY,
  CONTENT_CATEGORY_PAGE_CONTENTS_CACHE_KEY,
  CONTENT_CATEGORY_PAGE_META_CACHE_KEY
} from "@/common/constants/cacheKeys";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { ContentCategories, CategoryBannerAuditLogs } = models;

    const body = await req.json().catch(() => ({}));
    const { targetSlugs, allCategories, adminName } = body;

    let slugsToClear: string[] = [];

    if (allCategories || !targetSlugs || targetSlugs.length === 0) {
      const { delMany } = await import("@/db/redis/methods");
      await Promise.all([
        delMany({ prefix: "content_category_page" }),
        delMany({ prefix: "topic_page" }),
        delMany({ prefix: "sub_topic_page" }),
        delMany({ prefix: "sub_sub_topic_page" }),
        delMany({ prefix: "sub_sub_sub_topic_page" })
      ]);
      return NextResponse.json({
        success: true,
        message: "Redis cache refreshed successfully for all categories!"
      });
    } else {
      slugsToClear = targetSlugs;
    }

    // Generate keys for Redis deletion in safe batches
    const keysToDelete: string[] = [];
    slugsToClear.forEach((slug) => {
      keysToDelete.push(
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${slug}`,
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${slug}`,
        `${CONTENT_CATEGORY_PAGE_CONTENTS_CACHE_KEY}_${slug}`,
        `${CONTENT_CATEGORY_PAGE_META_CACHE_KEY}_${slug}`,
        `topic_page_${slug}`,
        `sub_topic_page_${slug}`,
        `sub_sub_topic_page_${slug}`,
        `sub_sub_sub_topic_page_${slug}`
      );
    });

    // Delete keys in batches of 500
    const BATCH_SIZE = 500;
    let deletedKeysCount = 0;
    for (let i = 0; i < keysToDelete.length; i += BATCH_SIZE) {
      const batch = keysToDelete.slice(i, i + BATCH_SIZE);
      await delFromRedis({ keys: batch }).catch((err) => {
        console.warn("[WARN Redis Del Batch]", err);
      });
      deletedKeysCount += batch.length;
    }

    const performer = adminName || "Admin";

    // Audit log
    await CategoryBannerAuditLogs.create({
      action: "REDIS_REFRESH",
      bannerTitle: "All Categories / Selected Banners",
      performedBy: performer,
      affectedCategoriesCount: slugsToClear.length,
      notes: `Refreshed Redis cache for ${slugsToClear.length} categories (${deletedKeysCount} cache keys purged safely).`
    });

    return NextResponse.json({
      success: true,
      message: `Redis cache refreshed successfully for ${slugsToClear.length} categories!`,
      totalCategories: slugsToClear.length,
      keysPurged: deletedKeysCount
    });
  } catch (error: any) {
    console.error("[ERR POST /api/admin/category-banners/redis/refresh]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
