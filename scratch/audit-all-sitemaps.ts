import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";

// Import all sitemap generators
import ProductsSitemap from "@/app/(frontend)/(sitemap)/products/sitemap";
import CategoriesSitemap from "@/app/(frontend)/(sitemap)/categories/sitemap";
import PagesSitemap from "@/app/(frontend)/(sitemap)/pages/sitemap";
import BlogsSitemap from "@/app/(frontend)/(sitemap)/blogs/sitemap";
import {
  getHomepageImagesSitemapData,
  getCategoryImagesSitemapData,
  getProductImagesSitemapData
} from "@/app/api/frontend/sitemap/images/controllers";

async function auditSitemaps() {
  console.log("================================================================================");
  console.log("                       COMPREHENSIVE SITEMAP AUDIT REPORT");
  console.log("================================================================================\n");

  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully\n");
  } catch (err: any) {
    console.warn("DB Connection notice:", err.message);
  }

  // 1. PRODUCTS SITEMAP
  console.log("--- 1. Products Sitemap (/products/sitemap.xml) ---");
  try {
    const products = await ProductsSitemap();
    console.log(`  Total URLs: ${products.length}`);
    let badUrls = 0;
    let missingDates = 0;
    products.forEach((p) => {
      if (!p.url.startsWith("http") || p.url.includes("//product")) badUrls++;
      if (!p.lastModified) missingDates++;
    });
    console.log(`  Sample URL 1: ${products[0]?.url}`);
    console.log(`  Sample URL 2: ${products[1]?.url}`);
    console.log(`  Formatting Errors: ${badUrls}, Missing Dates: ${missingDates}`);
  } catch (err: any) {
    console.error("  ❌ Products Sitemap Error:", err.message);
  }

  // 2. CATEGORIES SITEMAP
  console.log("\n--- 2. Categories & Topics Sitemap (/categories/sitemap.xml) ---");
  try {
    const categories = await CategoriesSitemap();
    console.log(`  Total URLs: ${categories.length}`);
    let badUrls = 0;
    let missingDates = 0;
    categories.forEach((c) => {
      if (!c.url.startsWith("http")) badUrls++;
      if (!c.lastModified) missingDates++;
    });
    console.log(`  Sample Category 1: ${categories[0]?.url}`);
    console.log(`  Sample Category 2: ${categories[1]?.url}`);
    console.log(`  Formatting Errors: ${badUrls}, Missing Dates: ${missingDates}`);
  } catch (err: any) {
    console.error("  ❌ Categories Sitemap Error:", err.message);
  }

  // 3. PAGES (SMALLER PAGES) SITEMAP
  console.log("\n--- 3. Pages / Smaller Pages Sitemap (/pages/sitemap.xml) ---");
  try {
    const pages = await PagesSitemap();
    console.log(`  Total URLs: ${pages.length}`);
    let badUrls = 0;
    let missingDates = 0;
    pages.forEach((p) => {
      if (!p.url.startsWith("http")) badUrls++;
      if (!p.lastModified) missingDates++;
    });
    console.log(`  Sample Page 1: ${pages[0]?.url}`);
    console.log(`  Sample Page 2: ${pages[1]?.url}`);
    console.log(`  Formatting Errors: ${badUrls}, Missing Dates: ${missingDates}`);
  } catch (err: any) {
    console.error("  ❌ Pages Sitemap Error:", err.message);
  }

  // 4. BLOGS SITEMAP
  console.log("\n--- 4. Blogs Sitemap (/blogs/sitemap.xml) ---");
  try {
    const blogs = await BlogsSitemap();
    console.log(`  Total URLs: ${blogs.length}`);
    let badUrls = 0;
    let missingDates = 0;
    blogs.forEach((b) => {
      if (!b.url.startsWith("http")) badUrls++;
      if (!b.lastModified) missingDates++;
    });
    console.log(`  Sample Blog 1: ${blogs[0]?.url}`);
    console.log(`  Sample Blog 2: ${blogs[1]?.url}`);
    console.log(`  Formatting Errors: ${badUrls}, Missing Dates: ${missingDates}`);
  } catch (err: any) {
    console.error("  ❌ Blogs Sitemap Error:", err.message);
  }

  // 5. IMAGES SITEMAP
  console.log("\n--- 5. Images Sitemap (/images/sitemap.xml) ---");
  try {
    const pImages = (await getProductImagesSitemapData()) || [];
    const cImages = (await getCategoryImagesSitemapData()) || [];
    const hImages = (await getHomepageImagesSitemapData()) || [];
    const totalImgItems = pImages.length + cImages.length + hImages.length;
    console.log(`  Total Items with Images: ${totalImgItems} (Products: ${pImages.length}, Categories: ${cImages.length}, Home: ${hImages.length})`);
    console.log(`  Sample Image Item 1: ${pImages[0]?.name} -> Image: ${pImages[0]?.images?.[0]}`);
  } catch (err: any) {
    console.error("  ❌ Images Sitemap Error:", err.message);
  }

  console.log("\n================================================================================");
  console.log("                          AUDIT COMPLETE");
  console.log("================================================================================");
  process.exit(0);
}

auditSitemaps();
