import { NextResponse } from "next/server";
import { COMPANY_URL_ENV } from "@/common/constants/environmentVariables";
import { GENERATE_SITEMAP } from "@/config/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!GENERATE_SITEMAP) {
    return new NextResponse("", { status: 404 });
  }

  const baseUrl = (COMPANY_URL_ENV || "https://floriwish.com").replace(/\/+$/, "");
  const lastMod = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/products/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/categories/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/blogs/sitemap.xml</loc>
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
