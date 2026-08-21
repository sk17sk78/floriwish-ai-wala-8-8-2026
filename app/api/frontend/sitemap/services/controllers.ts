// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Contents } = models;

// types
import { type SitemapData } from "@/common/types/sitemap";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// controllers - Only individual service packages / items (same as Giftlaya /s/ items)
export const getSitemapData = async (): Promise<SitemapData[] | null> => {
  try {
    await connectDB();

    const services = await Contents.find({
      isActive: true,
      type: "service"
    })
      .select(["slug", "updatedAt"])
      .sort({ updatedAt: -1 })
      .lean();

    if (!services) {
      return [];
    }

    const sitemapData: SitemapData[] = services.map(({ slug, updatedAt }) => ({
      slug: `product/${slug.trim().replace(/^\/+/, "")}`,
      updatedAt
    }));

    return sitemapData;
  } catch (error: any) {
    console.error("Error fetching services sitemap data:", error);
    return [];
  }
};
