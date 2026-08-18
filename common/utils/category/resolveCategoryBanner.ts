import models from "@/db/mongoose/models";
import connectDB from "@/db/mongoose/connection";

export async function resolveActiveGlobalCategoryBanner(slug: string) {
  try {
    await connectDB();
    const { GlobalCategoryBanners } = models;

    const now = new Date();

    const cleanSlug = (slug || "").trim().toLowerCase();
    if (!cleanSlug) return null;

    const escapedSlug = cleanSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const activeBanner = await GlobalCategoryBanners.findOne({
      isActive: true,
      $and: [
        {
          $or: [
            { allCategories: true },
            { "appliedCategories.slug": cleanSlug },
            { "appliedCategories.slug": { $regex: `^${escapedSlug}$`, $options: "i" } }
          ]
        },
        {
          $or: [
            { startDate: null },
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    })
      .sort({ priority: -1, updatedAt: -1 })
      .lean();

    if (!activeBanner) {
      return null;
    }

    return {
      type: activeBanner.bannerType || "default",
      targetDevice: activeBanner.targetDevice || "all",
      autoScroll: activeBanner.autoScroll ?? true,
      scrollInterval: activeBanner.scrollInterval || 7,
      loopInfinitely: true,
      showIndicators: true,
      isGlobalBanner: true,
      globalBannerId: String(activeBanner._id),
      globalBannerTitle: activeBanner.title,
      images: [
        {
          path: activeBanner.linkUrl || "",
          openInNewTab: activeBanner.openInNewTab || false,
          desktop: {
            url: activeBanner.desktopImage?.url || "",
            alt: activeBanner.altText || activeBanner.desktopImage?.alt || activeBanner.title || "Banner",
            width: activeBanner.desktopImage?.width || 1200,
            height: activeBanner.desktopImage?.height || 400
          },
          mobile: {
            url: activeBanner.mobileImage?.url || activeBanner.desktopImage?.url || "",
            alt: activeBanner.altText || activeBanner.mobileImage?.alt || activeBanner.title || "Banner",
            width: activeBanner.mobileImage?.width || 480,
            height: activeBanner.mobileImage?.height || 240
          }
        }
      ]
    };
  } catch (error) {
    console.error("[ERR resolveActiveGlobalCategoryBanner]", slug, error);
    return null;
  }
}
