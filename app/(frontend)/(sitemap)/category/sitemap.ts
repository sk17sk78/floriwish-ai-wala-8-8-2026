// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData as getSitemapCategories } from "@/app/api/frontend/sitemap/categories/controllers";
import { getSitemapData as getSitemapTopics } from "@/app/api/frontend/sitemap/topics/controllers";
import { getSitemapData as getSitemapSubTopics } from "@/app/api/frontend/sitemap/sub-topics/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;
      const sitemapCategory1 = (await getSitemapCategories()) || [];
      const sitemapCategory2 = (await getSitemapTopics()) || [];
      const sitemapCategory3 = (await getSitemapSubTopics()) || [];

      const allSitemaps = [
        ...sitemapCategory1,
        ...sitemapCategory2,
        ...sitemapCategory3
      ];

      const sitemap: Sitemap = allSitemaps.map(({ slug, updatedAt }) => ({
        url: `${canonicalDomain}/${slug.trim().replace(/^\/+/, "")}`,
        lastModified: updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        changeFrequency: "weekly",
        priority: 0.9
      }));

      return sitemap;
    } catch (error) {
      return [];
    }
  }

  return [];
}
