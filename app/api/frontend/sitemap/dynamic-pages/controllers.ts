// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { DynamicPages } = models;

// types
import { type SitemapData } from "@/common/types/sitemap";

// controllers
export const getSitemapData = async (): Promise<SitemapData[] | null> => {
  try {
    await connectDB();

    const dynamicPages = await DynamicPages.find({
      isActive: true
    })
      .select(["slug", "updatedAt"])
      .sort({ updatedAt: -1 })
      .lean();

    if (!dynamicPages) {
      return null;
    }

    const sitemapData: SitemapData[] = dynamicPages.map(
      ({ slug, updatedAt }: any) => ({
        slug,
        updatedAt
      })
    );

    return sitemapData;
  } catch (error: any) {
    console.error("Error fetching dynamic pages sitemap data:", error);
    return null;
  }
};
