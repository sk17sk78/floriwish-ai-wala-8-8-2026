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

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const canonicalDomain = DOMAIN.includes("localhost") ? "https://floriwish.com" : DOMAIN;

    const [
      productImages,
      categoryImages,
      serviceImages,
      topicImages,
      subTopicImages,
      blogImages,
      homepageImages
    ] = await Promise.all([
      getProductImagesSitemapData(),
      getCategoryImagesSitemapData(),
      getServiceImagesSitemapData(),
      getTopicImagesSitemapData(),
      getSubTopicImagesSitemapData(),
      getBlogImagesSitemapData(),
      getHomepageImagesSitemapData()
    ]);

    const allImageData = [
      ...(productImages || []),
      ...(categoryImages || []),
      ...(serviceImages || []),
      ...(topicImages || []),
      ...(subTopicImages || []),
      ...(blogImages || []),
      ...(homepageImages || [])
    ].filter((item) => item && item.images && item.images.length > 0);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allImageData
  .map((item) => {
    const slugPath = item.slug === "/" ? "" : item.slug.startsWith("/") ? item.slug : `/${item.slug}`;
    const loc = `${canonicalDomain}${slugPath}`;
    let rawTitle = (item.name || "Floriwish").trim().replace(/https?:\/\/localhost(:\d+)?/gi, "Floriwish");
    const cleanTitle = escapeXml(rawTitle);

    const imageBlocks = item.images
      .filter((img) => typeof img === "string" && img.startsWith("http"))
      .map(
        (img) => `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${cleanTitle}</image:title>
      <image:caption>${cleanTitle}</image:caption>
    </image:image>`
      )
      .join("\n");

    if (!imageBlocks) return "";

    return `  <url>
    <loc>${loc}</loc>
${imageBlocks}
  </url>`;
  })
  .filter(Boolean)
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
      }
    });
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
