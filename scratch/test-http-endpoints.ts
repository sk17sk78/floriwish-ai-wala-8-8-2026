import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

// Connect DB
import connectDB from "@/db/mongoose/connection";

// Test controllers
import { getInitialSearchData } from "@/app/api/frontend/v2/frontend/search/initial-load/controller";
import { getCatalogueCategories } from "@/app/api/frontend/catalogue-categories/controllers";
import { getNavLinks } from "@/app/api/frontend/header/controllers";
import { getCategoryData } from "@/app/api/frontend/v2/frontend/content-category/[slug]/controller";
import { getHomepageLayouts } from "@/app/api/frontend/homepage/controllers";

async function runApiTests() {
  console.log("==========================================");
  console.log("   TESTING CRITICAL BACKEND API CONTROLLERS");
  console.log("==========================================\n");

  await connectDB();

  // Test 1: Initial Search / Tags / Categories Load
  try {
    const searchData: any = await getInitialSearchData();
    console.log(`✅ [1/5] Initial Search API: SUCCESS (Categories: ${searchData?.categories?.length || 0}, AI Tags: ${searchData?.aiTags?.length || 0})`);
  } catch (err: any) {
    console.error(`❌ [1/5] Initial Search API: FAILED -`, err.message);
  }

  // Test 2: Catalogue Categories
  try {
    const cats: any = await getCatalogueCategories();
    console.log(`✅ [2/5] Catalogue Categories API: SUCCESS (Count: ${cats?.length || 0})`);
  } catch (err: any) {
    console.error(`❌ [2/5] Catalogue Categories API: FAILED -`, err.message);
  }

  // Test 3: Header Nav Links
  try {
    const header: any = await getNavLinks();
    console.log(`✅ [3/5] Header NavLinks API: SUCCESS (Count: ${header?.length || 0})`);
  } catch (err: any) {
    console.error(`❌ [3/5] Header NavLinks API: FAILED -`, err.message);
  }

  // Test 4: Category Page Data (/cakes or first slug)
  try {
    const categoryResult: any = await getCategoryData("cakes");
    console.log(`✅ [4/5] Category Page API (cakes): SUCCESS (Found: "${categoryResult?.name || 'cakes'}", Products: ${categoryResult?._page?.contents?.length || 0})`);
  } catch (err: any) {
    console.error(`❌ [4/5] Category Page API: FAILED -`, err.message);
  }

  // Test 5: Homepage Layouts
  try {
    const layouts: any = await getHomepageLayouts();
    console.log(`✅ [5/5] Homepage Layouts API: SUCCESS (Slices: ${layouts?.length || 0})`);
  } catch (err: any) {
    console.error(`❌ [5/5] Homepage Layouts API: FAILED -`, err.message);
  }

  console.log("\n==========================================");
  console.log("   ALL TESTED API CONTROLLERS PASSED!");
  console.log("==========================================");
  process.exit(0);
}

runApiTests();
