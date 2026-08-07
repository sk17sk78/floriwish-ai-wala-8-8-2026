// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData } from "@/app/api/frontend/sitemap/products/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const sitemapProducts = await getSitemapData() || [];

      const sitemaps: Sitemap = sitemapProducts.map(({ slug, updatedAt }) => ({
        url: `${DOMAIN}/${slug}`,
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 1
      }));

      return sitemaps;
    } catch (error) {
      // Return empty array during build time when API is not available
      return [];
    }
  }

  return [];
}
