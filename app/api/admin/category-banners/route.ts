import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { del as delFromRedis } from "@/db/redis/methods";
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { GlobalCategoryBanners, CategoryBannerAuditLogs, CategoryBannerJobs, ContentCategories } = models;

    const [banners, totalCategories, recentLogs, recentJobs] = await Promise.all([
      GlobalCategoryBanners.find().sort({ priority: -1, createdAt: -1 }).lean(),
      ContentCategories.countDocuments({ isActive: true }),
      CategoryBannerAuditLogs.find().sort({ createdAt: -1 }).limit(20).lean(),
      CategoryBannerJobs.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const activeBanners = banners.filter((b: any) => b.isActive);
    const inactiveBanners = banners.filter((b: any) => !b.isActive);

    // Calculate how many categories are currently covered
    let categoriesUsingBanner = 0;
    const hasAllCategoriesBanner = activeBanners.some((b: any) => b.allCategories);
    if (hasAllCategoriesBanner) {
      categoriesUsingBanner = totalCategories;
    } else {
      const coveredSlugs = new Set<string>();
      activeBanners.forEach((b: any) => {
        (b.appliedCategories || []).forEach((c: any) => {
          if (c.slug) coveredSlugs.add(c.slug);
        });
      });
      categoriesUsingBanner = coveredSlugs.size;
    }

    const lastUpdated = banners.length > 0 ? banners[0].updatedAt : null;
    const lastUpdatedBy = banners.length > 0 ? (banners[0].updatedBy || "Admin") : "N/A";

    return NextResponse.json({
      success: true,
      data: {
        banners,
        stats: {
          totalCategories,
          categoriesUsingBanner,
          activeBannerCount: activeBanners.length,
          inactiveBannerCount: inactiveBanners.length,
          totalBanners: banners.length,
          lastUpdated,
          lastUpdatedBy
        },
        recentLogs,
        recentJobs
      }
    });
  } catch (error: any) {
    console.error("[ERR GET /api/admin/category-banners]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { GlobalCategoryBanners, CategoryBannerAuditLogs, ContentCategories } = models;

    const body = await req.json();
    const {
      title,
      name,
      altText,
      linkUrl,
      openInNewTab,
      startDate,
      endDate,
      desktopImage,
      mobileImage,
      appliedCategories,
      allCategories,
      autoApplyFuture,
      isActive,
      priority,
      bannerType,
      autoScroll,
      scrollInterval,
      adminName
    } = body;

    if (!title || !name) {
      return NextResponse.json(
        { success: false, error: "Banner title and internal name are required." },
        { status: 400 }
      );
    }

    if (!desktopImage?.url || !mobileImage?.url) {
      return NextResponse.json(
        { success: false, error: "Both Desktop and Mobile banner images are required." },
        { status: 400 }
      );
    }

    const performer = adminName || "Admin";

    const newBanner = await GlobalCategoryBanners.create({
      title: title.trim(),
      name: name.trim(),
      altText: (altText || title).trim(),
      linkUrl: (linkUrl || "").trim(),
      openInNewTab: !!openInNewTab,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      desktopImage: {
        url: desktopImage.url,
        alt: desktopImage.alt || altText || title,
        width: desktopImage.width || 1200,
        height: desktopImage.height || 400
      },
      mobileImage: {
        url: mobileImage.url,
        alt: mobileImage.alt || altText || title,
        width: mobileImage.width || 480,
        height: mobileImage.height || 240
      },
      appliedCategories: Array.isArray(appliedCategories) ? appliedCategories : [],
      allCategories: !!allCategories,
      autoApplyFuture: autoApplyFuture !== undefined ? !!autoApplyFuture : true,
      isActive: isActive !== undefined ? !!isActive : true,
      priority: priority !== undefined ? Number(priority) : 10,
      bannerType: bannerType || "default",
      autoScroll: autoScroll !== undefined ? !!autoScroll : true,
      scrollInterval: scrollInterval ? Number(scrollInterval) : 7,
      createdBy: performer,
      updatedBy: performer
    });

    const affectedCount = allCategories
      ? await ContentCategories.countDocuments({ isActive: true })
      : (appliedCategories || []).length;

    // Create Audit Log
    await CategoryBannerAuditLogs.create({
      bannerId: newBanner._id,
      action: "CREATE",
      bannerTitle: newBanner.title,
      performedBy: performer,
      affectedCategoriesCount: affectedCount,
      newState: newBanner.toObject(),
      notes: `Created new banner campaign '${newBanner.title}' (${allCategories ? "All Categories" : `${affectedCount} categories`})`
    });

    // Invalidate Redis caches for affected categories
    if (appliedCategories && appliedCategories.length > 0 && !allCategories) {
      const keysToDel = appliedCategories.flatMap((c: any) => [
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${c.slug}`,
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${c.slug}`
      ]);
      await delFromRedis({ keys: keysToDel }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Banner campaign created successfully!",
      banner: newBanner
    });
  } catch (error: any) {
    console.error("[ERR POST /api/admin/category-banners]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
