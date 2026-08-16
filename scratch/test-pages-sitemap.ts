import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";
import { getSitemapData } from "@/app/api/frontend/sitemap/dynamic-pages/controllers";
import PagesSitemapGenerator from "@/app/(frontend)/(sitemap)/pages/sitemap";

async function testSitemap() {
  console.log("==========================================");
  console.log("   TESTING SMALLER PAGES SITEMAP");
  console.log("==========================================\n");

  await connectDB();

  // 1. Test Controller
  const sitemapData = await getSitemapData();
  console.log(`✅ Smaller Pages (Dynamic Pages) Controller returned: ${sitemapData?.length || 0} pages`);

  if (!sitemapData || sitemapData.length === 0) {
    console.error("❌ No data returned from getSitemapData");
    process.exit(1);
  }

  // 2. Test Next.js Sitemap Generator
  const sitemapXmlEntries = await PagesSitemapGenerator();
  console.log(`✅ Pages Sitemap Generator produced: ${sitemapXmlEntries.length} URL entries\n`);

  console.log("--- All Generated Smaller Page Sitemap URLs ---");
  sitemapXmlEntries.forEach((entry, idx) => {
    console.log(`${idx + 1}. URL: ${entry.url} (Priority: ${entry.priority}, Frequency: ${entry.changeFrequency})`);
  });

  console.log("\n==========================================");
  console.log("   SMALLER PAGES SITEMAP VERIFIED!");
  console.log("==========================================");
  process.exit(0);
}

testSitemap();
