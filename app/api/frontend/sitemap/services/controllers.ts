// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Contents, ContentCategories, SubTopics } = models;

// types
import { type SitemapData } from "@/common/types/sitemap";

export const getSitemapData = async (): Promise<SitemapData[] | null> => {
  try {
    await connectDB();

    // 1. Fetch all active decoration & service categories
    const serviceCategories = await ContentCategories.find({
      isActive: true,
      $or: [
        { slug: { $regex: /decor|service|jaimala|varmala|welcom|boot/i } },
        { name: { $regex: /decor|service|jaimala|varmala|welcom|boot/i } }
      ]
    })
      .select(["slug", "updatedAt"])
      .sort({ updatedAt: -1 })
      .lean();

    const categoryData: SitemapData[] = (serviceCategories || []).map(({ slug, updatedAt }) => ({
      slug: slug.trim().replace(/^\/+/, ""),
      updatedAt
    }));

    // 2. Fetch all service items from Contents collection (if any)
    const services = await Contents.find({
      isActive: true,
      type: "service"
    })
      .select(["slug", "updatedAt"])
      .sort({ updatedAt: -1 })
      .lean();

    const serviceData: SitemapData[] = (services || []).map(({ slug, updatedAt }) => ({
      slug: `product/${slug.trim().replace(/^\/+/, "")}`,
      updatedAt
    }));

    // 3. Fetch subtopics related to decoration services
    const serviceSubTopics = await SubTopics.find({
      isActive: true,
      slug: { $regex: /decor|service/i }
    })
      .select(["slug", "updatedAt"])
      .populate([
        { path: "category", select: ["slug"] },
        { path: "topic", select: ["slug"] }
      ])
      .sort({ updatedAt: -1 })
      .lean();

    const subTopicData: SitemapData[] = (serviceSubTopics || [])
      .filter((st: any) => st?.category?.slug && st?.topic?.slug)
      .map((st: any) => ({
        slug: `${st.category.slug}/${st.topic.slug}/${st.slug}`.trim().replace(/^\/+/, ""),
        updatedAt: st.updatedAt
      }));

    const combined = [...categoryData, ...serviceData, ...subTopicData];
    const seen = new Set<string>();
    const uniqueList: SitemapData[] = [];

    for (const item of combined) {
      if (item.slug && !seen.has(item.slug)) {
        seen.add(item.slug);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  } catch (error: any) {
    console.error("Error fetching services sitemap data:", error);
    return [];
  }
};
