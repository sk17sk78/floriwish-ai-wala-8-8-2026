import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";

// Models
import models from "@/db/mongoose/models";
const {
  Contents,
  ContentCategories,
  CatalogueCategories,
  HeaderNavLinks,
  Cities,
  DeliveryDetails,
  Occasions,
  Flavours,
  Relations,
  AdminRoles,
  Admins,
  Orders,
  BlogArticles,
  BlogCategories,
  BlogTags,
  BlogAuthors,
  HomepageLayouts,
  DynamicPages
} = models;

// Frontend Controllers
import { getInitialSearchData } from "@/app/api/frontend/v2/frontend/search/initial-load/controller";
import { getCatalogueCategories } from "@/app/api/frontend/catalogue-categories/controllers";
import { getNavLinks } from "@/app/api/frontend/header/controllers";
import { getCategoryData } from "@/app/api/frontend/v2/frontend/content-category/[slug]/controller";
import { getHomepageLayouts } from "@/app/api/frontend/homepage/controllers";

interface TestResult {
  category: string;
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function testRunner(
  category: string,
  name: string,
  fn: () => Promise<any>
) {
  const start = Date.now();
  try {
    const data = await fn();
    const duration = Date.now() - start;
    results.push({
      category,
      name,
      status: "PASS",
      detail: typeof data === "string" ? data : JSON.stringify(data),
      durationMs: duration
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({
      category,
      name,
      status: "FAIL",
      detail: err?.message || String(err),
      durationMs: duration
    });
  }
}

async function runComprehensiveTests() {
  console.log("================================================================================");
  console.log("              COMPREHENSIVE FULL-WEBSITE API & DATA AUDIT");
  console.log("================================================================================\n");

  await connectDB();

  // === 1. INFRASTRUCTURE & CACHE ===
  await testRunner("Infrastructure", "MongoDB Connection & State", async () => {
    const state = mongoose.connection.readyState;
    if (state !== 1) throw new Error(`MongoDB not ready. State: ${state}`);
    return `Connected to DB "${mongoose.connection.name}"`;
  });

  await testRunner("Infrastructure", "Redis Client & Ping", async () => {
    const { connectRedis } = await import("../db/redis/redis-client");
    const client = await connectRedis();
    const pong = await client.ping();
    return `Redis response: ${pong}`;
  });

  // === 2. FRONTEND PUBLIC DATA APIS ===
  await testRunner("Frontend API", "Search Initial Load (/api/.../search/initial-load)", async () => {
    const data: any = await getInitialSearchData();
    if (!data) throw new Error("Null data returned");
    return `Loaded ${data.categories?.length || 0} categories, ${data.trendingSearchKeywords?.length || 0} trending tags`;
  });

  await testRunner("Frontend API", "Catalogue Categories (/api/.../catalogue-categories)", async () => {
    const cats: any = await getCatalogueCategories();
    if (!cats || cats.length === 0) throw new Error("No catalogue categories returned");
    return `Loaded ${cats.length} catalogue categories`;
  });

  await testRunner("Frontend API", "Header Nav Links (/api/frontend/header)", async () => {
    const nav: any = await getNavLinks();
    if (!nav || nav.length === 0) throw new Error("No nav links returned");
    return `Loaded ${nav.length} top navigation menus`;
  });

  await testRunner("Frontend API", "Homepage Slices (/api/frontend/homepage)", async () => {
    const layouts = await getHomepageLayouts();
    if (!layouts || layouts.length === 0) throw new Error("No homepage layouts found");
    return `Loaded ${layouts.length} homepage sections (Banners, Grids, etc.)`;
  });

  await testRunner("Frontend API", "Category Data Controller - /cakes", async () => {
    const catData = await getCategoryData("cakes");
    if (!catData) throw new Error("Category /cakes not found");
    return `Found "${catData.name}", ${catData._page?.contents?.length || 0} active products`;
  });

  await testRunner("Frontend API", "Category Data Controller - /flowers or first cat", async () => {
    const firstCat = await ContentCategories.findOne({ isActive: true }).select("slug name");
    if (!firstCat) throw new Error("No active category in DB");
    const catData = await getCategoryData(firstCat.slug);
    return `Found "${catData?.name}" (${firstCat.slug}), ${catData?._page?.contents?.length || 0} products`;
  });

  // === 3. PRESET & LOCATION APIS ===
  await testRunner("Presets & Locations", "Cities List (500+ Cities)", async () => {
    const citiesCount = await Cities.countDocuments({ isActive: true });
    const topCitiesCount = await Cities.countDocuments({ isActive: true, isTopCity: true });
    return `Total active cities: ${citiesCount}, Top Metro cities: ${topCitiesCount}`;
  });

  await testRunner("Presets & Locations", "Delivery Details Presets", async () => {
    const count = await DeliveryDetails.countDocuments({ isActive: true });
    return `Loaded ${count} active delivery time detail slots`;
  });

  await testRunner("Presets & Locations", "Occasions Presets", async () => {
    const count = await Occasions.countDocuments({ isActive: true });
    return `Loaded ${count} active occasions`;
  });

  await testRunner("Presets & Locations", "Flavours Presets", async () => {
    const count = await Flavours.countDocuments({ isActive: true });
    return `Loaded ${count} active cake flavours`;
  });

  await testRunner("Presets & Locations", "Relations Presets", async () => {
    const count = await Relations.countDocuments({ isActive: true });
    return `Loaded ${count} active relations`;
  });

  // === 4. PRODUCTS & DYNAMIC PAGES ===
  await testRunner("Products & Content", "Live Products Integrity", async () => {
    const total = await Contents.countDocuments({ isActive: true });
    const sampleProduct = await Contents.findOne({ isActive: true })
      .select("name slug price media")
      .lean();
    if (!sampleProduct) throw new Error("No active product found");
    return `Active products: ${total}. Sample: "${sampleProduct.name}" (/product/${sampleProduct.slug})`;
  });

  await testRunner("Products & Content", "Dynamic Pages Integrity", async () => {
    const count = await DynamicPages.countDocuments();
    return `Dynamic custom pages found: ${count}`;
  });

  // === 5. BLOG APIS ===
  await testRunner("Blog System", "Blog Articles", async () => {
    const count = await BlogArticles.countDocuments();
    const sample = await BlogArticles.findOne().select("heading slug");
    return `Articles: ${count}. Sample: "${sample?.heading || 'None'}"`;
  });

  await testRunner("Blog System", "Blog Categories & Tags", async () => {
    const cats = await BlogCategories.countDocuments();
    const tags = await BlogTags.countDocuments();
    const authors = await BlogAuthors.countDocuments();
    return `Categories: ${cats}, Tags: ${tags}, Authors: ${authors}`;
  });

  // === 6. ADMIN, ROLES & ACCESS CONTROL ===
  await testRunner("Admin & Auth", "Admin Roles & Permissions", async () => {
    const count = await AdminRoles.countDocuments();
    const roles = await AdminRoles.find().select("name permission").lean();
    return `Total Roles: ${count} (${roles.map((r: any) => r.name).join(", ")})`;
  });

  await testRunner("Admin & Auth", "Admin Staff Users", async () => {
    const count = await Admins.countDocuments({ status: "active" });
    const superAdmin = await Admins.findOne({ isSuperAdmin: true }).select("userName");
    return `Active Admins: ${count}. SuperAdmin: ${superAdmin?.userName || 'Present'}`;
  });

  await testRunner("Admin & Auth", "Orders System", async () => {
    const count = await Orders.countDocuments();
    return `Total system orders recorded: ${count}`;
  });

  // === PRINT RESULTS SUMMARY TABLE ===
  console.log("\n================================================================================");
  console.log("                           TEST EXECUTION SUMMARY");
  console.log("================================================================================\n");

  let passCount = 0;
  let failCount = 0;

  for (const res of results) {
    const icon = res.status === "PASS" ? "✅" : res.status === "WARN" ? "⚠️" : "❌";
    if (res.status === "PASS") passCount++;
    else failCount++;

    const catStr = `[${res.category}]`.padEnd(22, " ");
    const nameStr = res.name.padEnd(45, " ");
    const timeStr = `${res.durationMs}ms`.padStart(8, " ");
    console.log(`${icon} ${catStr} ${nameStr} (${timeStr}) -> ${res.detail}`);
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL AUDITED: ${results.length} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log("================================================================================\n");

  process.exit(failCount > 0 ? 1 : 0);
}

runComprehensiveTests();
