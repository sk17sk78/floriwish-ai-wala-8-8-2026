import {
  getBlogImagesSitemapData,
  getCategoryImagesSitemapData,
  getHomepageImagesSitemapData,
  getProductImagesSitemapData,
  getServiceImagesSitemapData,
  getSubTopicImagesSitemapData,
  getTopicImagesSitemapData
} from "@/app/api/frontend/sitemap/images/controllers";
import { DOMAIN } from "@/common/constants/environmentVariables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      homepageImages,
      categoryImages,
      productImages,
      serviceImages,
      topicImages,
      subTopicImages,
      blogImages
    ] = await Promise.all([
      getHomepageImagesSitemapData(),
      getCategoryImagesSitemapData(),
      getProductImagesSitemapData(),
      getServiceImagesSitemapData(),
      getTopicImagesSitemapData(),
      getSubTopicImagesSitemapData(),
      getBlogImagesSitemapData()
    ]);

    const allImageData = [
      ...(homepageImages || []),
      ...(categoryImages || []),
      ...(productImages || []),
      ...(serviceImages || []),
      ...(topicImages || []),
      ...(subTopicImages || []),
      ...(blogImages || [])
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${allImageData
    .map((item) => {
      const loc = `${DOMAIN}${item.slug.startsWith("/") ? "" : "/"}${item.slug}`;
      return `
  <url>
    <loc>${loc}</loc>
    ${item.images
      .filter((img) => img)
      .map(
        (img) => `
    <image:image>
      <image:loc>${img}</image:loc>
      <image:caption>${item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:caption>
    </image:image>`
      )
      .join("")}
  </url>`;
    })
    .join("")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
      }
    });
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
