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
      const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;
      const sitemapProducts = (await getSitemapData()) || [];

      const sitemaps: Sitemap = sitemapProducts.map(({ slug, updatedAt }) => ({
        url: `${canonicalDomain}/${slug.replace(/^\/+/, "")}`,
        lastModified: updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        changeFrequency: "weekly",
        priority: 0.8
      }));

      return sitemaps;
    } catch (error) {
      return [];
    }
  }

  return [];
}
