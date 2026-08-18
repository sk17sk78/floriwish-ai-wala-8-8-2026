import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { del as delFromRedis } from "@/db/redis/methods";
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { GlobalCategoryBanners } = models;

    const banner = await GlobalCategoryBanners.findById(id).lean();
    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { GlobalCategoryBanners, CategoryBannerAuditLogs, ContentCategories } = models;

    const banner = await GlobalCategoryBanners.findById(id);
    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    const previousState = banner.toObject();
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
      targetDevice,
      priority,
      bannerType,
      autoScroll,
      scrollInterval,
      adminName
    } = body;

    const performer = adminName || "Admin";

    if (title !== undefined) banner.title = title.trim();
    if (name !== undefined) banner.name = name.trim();
    if (altText !== undefined) banner.altText = altText.trim();
    if (linkUrl !== undefined) banner.linkUrl = linkUrl.trim();
    if (openInNewTab !== undefined) banner.openInNewTab = !!openInNewTab;
    if (startDate !== undefined) banner.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;
    const effectiveDesktop = desktopImage?.url ? desktopImage : (mobileImage?.url ? mobileImage : banner.desktopImage);
    const effectiveMobile = mobileImage?.url ? mobileImage : (desktopImage?.url ? desktopImage : banner.mobileImage);

    if (effectiveDesktop?.url) {
      banner.desktopImage = {
        url: effectiveDesktop.url,
        alt: effectiveDesktop.alt || banner.altText || banner.title,
        width: effectiveDesktop.width || 1200,
        height: effectiveDesktop.height || 400
      };
    }
    if (effectiveMobile?.url) {
      banner.mobileImage = {
        url: effectiveMobile.url,
        alt: effectiveMobile.alt || banner.altText || banner.title,
        width: effectiveMobile.width || 480,
        height: effectiveMobile.height || 240
      };
    }
    if (appliedCategories !== undefined) banner.appliedCategories = appliedCategories;
    if (allCategories !== undefined) banner.allCategories = !!allCategories;
    if (autoApplyFuture !== undefined) banner.autoApplyFuture = !!autoApplyFuture;
    if (isActive !== undefined) banner.isActive = !!isActive;
    if (targetDevice !== undefined) banner.targetDevice = targetDevice;
    if (priority !== undefined) banner.priority = Number(priority);
    if (bannerType !== undefined) banner.bannerType = bannerType;
    if (autoScroll !== undefined) banner.autoScroll = !!autoScroll;
    if (scrollInterval !== undefined) banner.scrollInterval = Number(scrollInterval);
    banner.updatedBy = performer;

    await banner.save();

    const affectedCount = banner.allCategories
      ? await ContentCategories.countDocuments({ isActive: true })
      : (banner.appliedCategories || []).length;

    // Action type for log
    let actionType: any = "UPDATE";
    if (previousState.isActive !== banner.isActive) {
      actionType = banner.isActive ? "ACTIVATE" : "DEACTIVATE";
    }

    await CategoryBannerAuditLogs.create({
      bannerId: banner._id,
      action: actionType,
      bannerTitle: banner.title,
      performedBy: performer,
      affectedCategoriesCount: affectedCount,
      previousState,
      newState: banner.toObject(),
      notes: `Updated banner '${banner.title}' (Status: ${banner.isActive ? "Active" : "Inactive"}, Categories: ${banner.allCategories ? "All" : affectedCount})`
    });

    // Invalidate Redis cache for affected categories
    const allAffectedSlugs = new Set<string>();
    (previousState.appliedCategories || []).forEach((c: any) => c.slug && allAffectedSlugs.add(c.slug));
    (banner.appliedCategories || []).forEach((c: any) => c.slug && allAffectedSlugs.add(c.slug));

    if (allAffectedSlugs.size > 0 && !banner.allCategories) {
      const keysToDel = Array.from(allAffectedSlugs).flatMap((slug) => [
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${slug}`,
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${slug}`
      ]);
      await delFromRedis({ keys: keysToDel }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully!",
      banner
    });
  } catch (error: any) {
    console.error("[ERR PUT /api/admin/category-banners/[id]]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { GlobalCategoryBanners, CategoryBannerAuditLogs, ContentCategories } = models;

    const banner = await GlobalCategoryBanners.findById(id);
    if (!banner) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    const previousState = banner.toObject();
    const affectedCount = banner.allCategories
      ? await ContentCategories.countDocuments({ isActive: true })
      : (banner.appliedCategories || []).length;

    await GlobalCategoryBanners.findByIdAndDelete(id);

    await CategoryBannerAuditLogs.create({
      bannerId: banner._id,
      action: "DELETE",
      bannerTitle: banner.title,
      performedBy: "Admin",
      affectedCategoriesCount: affectedCount,
      previousState,
      notes: `Deleted banner campaign '${banner.title}'. All affected categories reverted to default/native banners.`
    });

    // Clear Redis cache so original category banners instantly become visible again
    const affectedSlugs = (banner.appliedCategories || []).map((c: any) => c.slug).filter(Boolean);
    if (affectedSlugs.length > 0 && !banner.allCategories) {
      const keysToDel = affectedSlugs.flatMap((slug: string) => [
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${slug}`,
        `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${slug}`
      ]);
      await delFromRedis({ keys: keysToDel }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully! Categories have reverted to their original banners."
    });
  } catch (error: any) {
    console.error("[ERR DELETE /api/admin/category-banners/[id]]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
