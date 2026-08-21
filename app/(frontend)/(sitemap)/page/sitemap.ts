// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData } from "@/app/api/frontend/sitemap/dynamic-pages/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

const STATIC_CORE_PAGES = [
  { slug: "", priority: 1.0, changeFrequency: "daily" as const },
  { slug: "about", priority: 0.7, changeFrequency: "monthly" as const },
  { slug: "contact", priority: 0.7, changeFrequency: "monthly" as const },
  { slug: "faqs", priority: 0.7, changeFrequency: "monthly" as const },
  { slug: "franchise", priority: 0.7, changeFrequency: "monthly" as const },
  { slug: "vendor/register", priority: 0.7, changeFrequency: "monthly" as const },
  { slug: "blog", priority: 0.8, changeFrequency: "weekly" as const },
];

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;
      const sitemapDynamicPages = (await getSitemapData()) || [];
      const today = new Date().toISOString().split("T")[0];

      const staticSitemaps: Sitemap = STATIC_CORE_PAGES.map(({ slug, priority, changeFrequency }) => ({
        url: slug ? `${canonicalDomain}/${slug}` : canonicalDomain,
        lastModified: today,
        changeFrequency,
        priority
      }));

      const seenUrls = new Set(staticSitemaps.map((s) => s.url));

      const dynamicSitemaps: Sitemap = sitemapDynamicPages
        .map(({ slug, updatedAt }) => {
          const url = `${canonicalDomain}/${slug.replace(/^\/+/, "")}`;
          return {
            url,
            lastModified: updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : today,
            changeFrequency: "weekly" as const,
            priority: 0.7
          };
        })
        .filter(({ url }) => !seenUrls.has(url));

      return [...staticSitemaps, ...dynamicSitemaps];
    } catch (error) {
      return [];
    }
  }

  return [];
}
