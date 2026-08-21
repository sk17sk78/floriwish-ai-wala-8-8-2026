// config
import { GENERATE_SITEMAP } from "@/config/sitemap";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// controllers
import { getSitemapData } from "@/app/api/frontend/sitemap/blogs/controllers";

// types
import { type Sitemap } from "@/common/types/sitemap";

export default async function Sitemap(): Promise<Sitemap> {
  if (GENERATE_SITEMAP) {
    try {
      const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;
      const sitemapBlogs = (await getSitemapData()) || [];
      const today = new Date().toISOString().split("T")[0];

      // 1. Main Blog Hub Page
      const blogHub: Sitemap = [
        {
          url: `${canonicalDomain}/blog`,
          lastModified: today,
          changeFrequency: "daily",
          priority: 0.8
        }
      ];

      // 2. All Blog Articles
      const blogArticles: Sitemap = sitemapBlogs.map(({ slug, updatedAt }) => ({
        url: `${canonicalDomain}/${slug.startsWith("blog/") ? slug : `blog/${slug}`}`,
        changeFrequency: "weekly",
        lastModified: updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : today,
        priority: 0.7
      }));

      return [...blogHub, ...blogArticles];
    } catch (error) {
      return [];
    }
  }

  return [];
}
