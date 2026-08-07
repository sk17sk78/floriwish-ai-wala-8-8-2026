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
      const sitemapBlogs = await getSitemapData() || [];

      const sitemap: Sitemap = sitemapBlogs.map(({ slug, updatedAt }) => ({
        url: `${DOMAIN}/blog/${slug}`,   // ✅ FIXED
        changeFrequency: "monthly",
        lastModified: updatedAt,
        priority: 0.5
      }));

      return sitemap;
    } catch (error) {
      return [];
    }
  }

  return [];
}
