// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData } from "@/app/api/frontend/sitemap/dynamic-pages/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const sitemapDynamicPages = (await getSitemapData()) || [];

      const sitemap: Sitemap = sitemapDynamicPages.map(({ slug, updatedAt }) => ({
        url: `${DOMAIN}/${slug}`,
        lastModified: updatedAt,
        changeFrequency: "weekly",
        priority: 0.8
      }));

      return sitemap;
    } catch (error) {
      return [];
    }
  }

  return [];
}
