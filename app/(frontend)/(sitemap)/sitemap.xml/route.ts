import { NextResponse } from "next/server";
import { DOMAIN, COMPANY_URL_ENV } from "@/common/constants/environmentVariables";
import { GENERATE_SITEMAP } from "@/config/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!GENERATE_SITEMAP) {
    return new NextResponse("", { status: 404 });
  }

  const rawDomain = COMPANY_URL_ENV || DOMAIN || "https://floriwish.com";
  const baseUrl = rawDomain.includes("localhost") ? "https://floriwish.com" : rawDomain.replace(/\/+$/, "");
  const lastMod = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format like Giftlaya

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/category/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/page/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/product/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/service/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/blog/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/images/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
