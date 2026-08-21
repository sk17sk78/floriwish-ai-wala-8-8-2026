// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData } from "@/app/api/frontend/sitemap/services/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;
      const sitemapServices = (await getSitemapData()) || [];

      const sitemaps: Sitemap = sitemapServices.map(({ slug, updatedAt }) => ({
        url: `${canonicalDomain}/${slug.trim().replace(/^\/+/, "")}`,
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
