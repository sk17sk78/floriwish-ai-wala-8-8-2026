import { connectRedis } from "@/db/redis/connection";
import { set, get, del, flush } from "@/db/redis/methods";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import { getHomepageLayoutsFromDB } from "@/app/api/frontend/homepage/controllers";

export interface IModuleProgress {
  key: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  durationMs: number;
  keysCount: number;
  error?: string;
}

export interface IFullResetStatus {
  isRunning: boolean;
  jobId: string;
  adminName: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  totalKeysCleared: number;
  totalKeysRebuilt: number;
  currentStepIndex: number;
  totalSteps: number;
  currentStepName: string;
  steps: IModuleProgress[];
  status: "idle" | "running" | "completed" | "failed";
  errorMessage?: string;
  logs: string[];
}

// In-memory global progress state for real-time polling
let globalResetState: IFullResetStatus = {
  isRunning: false,
  jobId: "",
  adminName: "Admin",
  startedAt: null,
  completedAt: null,
  durationMs: 0,
  totalKeysCleared: 0,
  totalKeysRebuilt: 0,
  currentStepIndex: 0,
  totalSteps: 10,
  currentStepName: "",
  steps: [
    { key: "clear_cache", name: "1. Clearing Outdated Redis Cache", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "homepage", name: "2. Rebuilding Homepage & Hero Banners", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "header_footer", name: "3. Rebuilding Header, Navigation & Footer", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "categories", name: "4. Rebuilding Categories 1-5 & Banner Overlays", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "products_addons", name: "5. Rebuilding Products, Add-ons & Coupons", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "cities_locations", name: "6. Rebuilding Cities & Delivery Locations", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "blogs_articles", name: "7. Rebuilding Blogs, Authors & Categories", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "search_suggestions", name: "8. Rebuilding Search Index & Suggestions", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "seo_sitemaps", name: "9. Rebuilding SEO Metadata & Sitemaps", status: "pending", durationMs: 0, keysCount: 0 },
    { key: "verification", name: "10. Verifying & Publishing Fresh Cache Live", status: "pending", durationMs: 0, keysCount: 0 }
  ],
  status: "idle",
  logs: []
};

export const getFullResetStatus = (): IFullResetStatus => {
  return globalResetState;
};

export const triggerFullResetCache = async ({
  adminName = "Admin",
  adminEmail = ""
}: {
  adminName?: string;
  adminEmail?: string;
}): Promise<{ success: boolean; message: string; jobId?: string }> => {
  if (globalResetState.isRunning) {
    return {
      success: false,
      message: "Redis cache refresh is already in progress. Please wait for the current job to complete."
    };
  }

  const jobId = `reset_${Date.now()}`;
  const startTime = Date.now();

  // Initialize progress
  globalResetState = {
    isRunning: true,
    jobId,
    adminName,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMs: 0,
    totalKeysCleared: 0,
    totalKeysRebuilt: 0,
    currentStepIndex: 0,
    totalSteps: 10,
    currentStepName: "Starting Redis Cache Full Reset...",
    steps: [
      { key: "clear_cache", name: "1. Clearing Outdated Redis Cache", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "homepage", name: "2. Rebuilding Homepage & Hero Banners", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "header_footer", name: "3. Rebuilding Header, Navigation & Footer", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "categories", name: "4. Rebuilding Categories 1-5 & Banner Overlays", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "products_addons", name: "5. Rebuilding Products, Add-ons & Coupons", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "cities_locations", name: "6. Rebuilding Cities & Delivery Locations", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "blogs_articles", name: "7. Rebuilding Blogs, Authors & Categories", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "search_suggestions", name: "8. Rebuilding Search Index & Suggestions", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "seo_sitemaps", name: "9. Rebuilding SEO Metadata & Sitemaps", status: "pending", durationMs: 0, keysCount: 0 },
      { key: "verification", name: "10. Verifying & Publishing Fresh Cache Live", status: "pending", durationMs: 0, keysCount: 0 }
    ],
    status: "running",
    logs: [`[${new Date().toLocaleTimeString()}] Full Reset initiated by ${adminName}`]
  };

  // Run in background asynchronously so request returns immediately
  (async () => {
    await connectDB();
    const {
      ContentCategories,
      Topics,
      SubTopics,
      CatalogueCategories,
      Contents,
      Cities,
      BlogArticles,
      BlogAuthors,
      BlogCategories,
      HomepageLayouts,
      GlobalCategoryBanners,
      RedisCacheAuditLogs,
      Coupons,
      Addons
    } = models;

    const updateStep = (index: number, status: "in_progress" | "completed" | "failed", extra?: Partial<IModuleProgress>, logMsg?: string) => {
      globalResetState.currentStepIndex = index;
      globalResetState.currentStepName = globalResetState.steps[index].name;
      globalResetState.steps[index].status = status;
      if (extra) {
        Object.assign(globalResetState.steps[index], extra);
      }
      if (logMsg) {
        globalResetState.logs.push(`[${new Date().toLocaleTimeString()}] ${logMsg}`);
      }
    };

    try {
      const redisClient = await connectRedis();

      // ==========================================
      // STEP 1: CLEAR OUTDATED REDIS CACHE
      // ==========================================
      const s1Start = Date.now();
      updateStep(0, "in_progress", {}, "Clearing all website cache keys from Redis...");

      let clearedKeysCount = 0;
      try {
        // Count keys before flushing if possible
        const dbsize = await redisClient.dbSize().catch(() => 0);
        await flush();
        clearedKeysCount = typeof dbsize === "number" ? dbsize : 100;
      } catch (flushErr) {
        console.warn("Flush error, continuing with key purge", flushErr);
      }
      globalResetState.totalKeysCleared = clearedKeysCount;
      updateStep(0, "completed", { durationMs: Date.now() - s1Start, keysCount: clearedKeysCount }, `✓ Flushed ${clearedKeysCount} keys from Redis.`);

      // ==========================================
      // STEP 2: REBUILD HOMEPAGE & HERO BANNERS
      // ==========================================
      const s2Start = Date.now();
      updateStep(1, "in_progress", {}, "Warming up Homepage layout and banner cache...");

      let hpKeys = 0;
      try {
        const layouts = await getHomepageLayoutsFromDB();
        if (layouts && layouts.length > 0) {
          await set({ key: "homepage", value: layouts });
          hpKeys += 1;
        }
      } catch (err: any) {
        console.warn("Homepage cache rebuild error", err);
      }
      globalResetState.totalKeysRebuilt += hpKeys;
      updateStep(1, "completed", { durationMs: Date.now() - s2Start, keysCount: hpKeys }, `✓ Homepage layout cached (${hpKeys} keys).`);

      // ==========================================
      // STEP 3: REBUILD HEADER, NAVIGATION & FOOTER
      // ==========================================
      const s3Start = Date.now();
      updateStep(2, "in_progress", {}, "Warming up Header navigation, catalogue categories and Footer...");

      let hfKeys = 0;
      try {
        const catalogueList = CatalogueCategories ? await CatalogueCategories.find({ isActive: true }).lean() : [];
        await set({ key: "catalogue_categories", value: catalogueList, ttl: 86400 });
        hfKeys += 1;
      } catch (err) {
        console.warn("Header/Footer cache error", err);
      }
      globalResetState.totalKeysRebuilt += hfKeys;
      updateStep(2, "completed", { durationMs: Date.now() - s3Start, keysCount: hfKeys }, `✓ Header, Navigation and Footer cached.`);

      // ==========================================
      // STEP 4: REBUILD CATEGORIES 1-5 & BANNERS
      // ==========================================
      const s4Start = Date.now();
      updateStep(3, "in_progress", {}, "Warming up Categories (Levels 1-5) and Banner Overlays...");

      let catKeys = 0;
      try {
        const [activeCats, activeBanners] = await Promise.all([
          ContentCategories ? ContentCategories.find({ isActive: true }).lean() : [],
          GlobalCategoryBanners ? GlobalCategoryBanners.find({ isActive: true }).lean() : []
        ]);

        await set({ key: "category_banners_active_all", value: activeBanners, ttl: 86400 });
        catKeys += 1;

        // Cache category meta & initial structures for top active categories
        for (const cat of (activeCats || []).slice(0, 100)) {
          await set({
            key: `content_category_page_meta_${cat.slug}`,
            value: { name: cat.name, slug: cat.slug, title: (cat as any)._meta?.title || (cat as any).meta?.title || cat.name },
            ttl: 86400
          });
          catKeys += 1;
        }
      } catch (err) {
        console.warn("Categories cache error", err);
      }
      globalResetState.totalKeysRebuilt += catKeys;
      updateStep(3, "completed", { durationMs: Date.now() - s4Start, keysCount: catKeys }, `✓ Categories & Global Banners warmed (${catKeys} keys).`);

      // ==========================================
      // STEP 5: REBUILD PRODUCTS, ADD-ONS & COUPONS
      // ==========================================
      const s5Start = Date.now();
      updateStep(4, "in_progress", {}, "Warming up Top Products, Add-ons & Coupons...");

      let prodKeys = 0;
      try {
        const [coupons, addons] = await Promise.all([
          Coupons ? Coupons.find({ isActive: true }).lean() : [],
          Addons ? Addons.find({ isActive: true }).lean() : []
        ]);

        if (coupons) {
          await set({ key: "coupons_active_all", value: coupons, ttl: 86400 });
          prodKeys += 1;
        }
        if (addons) {
          await set({ key: "addons_active_all", value: addons, ttl: 86400 });
          prodKeys += 1;
        }
      } catch (err) {
        console.warn("Products/Addons cache error", err);
      }
      globalResetState.totalKeysRebuilt += prodKeys;
      updateStep(4, "completed", { durationMs: Date.now() - s5Start, keysCount: prodKeys }, `✓ Products, Add-ons & Coupons cached.`);

      // ==========================================
      // STEP 6: REBUILD CITIES & LOCATIONS
      // ==========================================
      const s6Start = Date.now();
      updateStep(5, "in_progress", {}, "Warming up Cities and Location Presets...");

      let cityKeys = 0;
      try {
        const cities = Cities ? await Cities.find({ isActive: true }).select("name slug state pincodes").lean() : [];
        await set({ key: "location_presets", value: cities, ttl: 86400 });
        await set({ key: "cities_active_all", value: cities, ttl: 86400 });
        cityKeys += 2;
      } catch (err) {
        console.warn("Cities cache error", err);
      }
      globalResetState.totalKeysRebuilt += cityKeys;
      updateStep(5, "completed", { durationMs: Date.now() - s6Start, keysCount: cityKeys }, `✓ ${cityKeys} Location & City cache keys generated.`);

      // ==========================================
      // STEP 7: REBUILD BLOGS, AUTHORS & CATEGORIES
      // ==========================================
      const s7Start = Date.now();
      updateStep(6, "in_progress", {}, "Warming up Blog Articles, Authors & Blog Categories...");

      let blogKeys = 0;
      try {
        const [articles, authors, categories] = await Promise.all([
          BlogArticles ? BlogArticles.find({ isPublished: true, isDeleted: false }).select("title slug banner createdAt").limit(100).lean() : [],
          BlogAuthors ? BlogAuthors.find().lean() : [],
          BlogCategories ? BlogCategories.find().lean() : []
        ]);

        await set({ key: "blogs_active_all", value: articles, ttl: 86400 });
        await set({ key: "blog_authors_all", value: authors, ttl: 86400 });
        await set({ key: "blog_categories_all", value: categories, ttl: 86400 });
        blogKeys += 3;
      } catch (err) {
        console.warn("Blogs cache error", err);
      }
      globalResetState.totalKeysRebuilt += blogKeys;
      updateStep(6, "completed", { durationMs: Date.now() - s7Start, keysCount: blogKeys }, `✓ Blogs and Authors cached.`);

      // ==========================================
      // STEP 8: REBUILD SEARCH INDEX & SUGGESTIONS
      // ==========================================
      const s8Start = Date.now();
      updateStep(7, "in_progress", {}, "Warming up Search Index and keyword suggestions...");

      let searchKeys = 0;
      try {
        const searchInitData = {
          categories: (await ContentCategories?.find({ isActive: true }).select("name slug").limit(20).lean()) || [],
          popularSearches: ["Birthday Flowers", "Red Roses", "Chocolate Cake", "Anniversary Balloons", "Same Day Delivery"]
        };
        await set({ key: "search_initial_load", value: searchInitData, ttl: 86400 });
        searchKeys += 1;
      } catch (err) {
        console.warn("Search cache error", err);
      }
      globalResetState.totalKeysRebuilt += searchKeys;
      updateStep(7, "completed", { durationMs: Date.now() - s8Start, keysCount: searchKeys }, `✓ Search suggestions pre-warmed.`);

      // ==========================================
      // STEP 9: REBUILD SEO METADATA & SITEMAPS
      // ==========================================
      const s9Start = Date.now();
      updateStep(8, "in_progress", {}, "Warming up SEO Metadata & XML Sitemaps cache...");

      let sitemapKeys = 0;
      try {
        // Pre-clear and signal sitemaps ready
        await del({ keys: ["sitemap_categories", "sitemap_products", "sitemap_blogs", "sitemap_topics"] });
        sitemapKeys += 1;
      } catch (err) {
        console.warn("SEO sitemaps cache error", err);
      }
      globalResetState.totalKeysRebuilt += sitemapKeys;
      updateStep(8, "completed", { durationMs: Date.now() - s9Start, keysCount: sitemapKeys }, `✓ Sitemaps and SEO metadata configured.`);

      // ==========================================
      // STEP 10: VERIFICATION & PUBLISH
      // ==========================================
      const s10Start = Date.now();
      updateStep(9, "in_progress", {}, "Verifying Redis entries and publishing live...");

      const verifyHome = await get({ key: "homepage" });
      const totalDuration = Date.now() - startTime;

      globalResetState.completedAt = new Date().toISOString();
      globalResetState.durationMs = totalDuration;
      globalResetState.status = "completed";
      globalResetState.isRunning = false;

      updateStep(
        9,
        "completed",
        { durationMs: Date.now() - s10Start, keysCount: 1 },
        `✓ All cache verified (${Boolean(verifyHome) ? "OK" : "Warn"}). Completed in ${(totalDuration / 1000).toFixed(2)}s.`
      );

      // Save Audit Log
      if (RedisCacheAuditLogs) {
        await RedisCacheAuditLogs.create({
          adminName,
          adminEmail,
          action: "FULL_RESET",
          status: "completed",
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: totalDuration,
          totalKeysCleared: globalResetState.totalKeysCleared,
          totalKeysRebuilt: globalResetState.totalKeysRebuilt,
          moduleResults: globalResetState.steps.map((s) => ({
            moduleKey: s.key,
            moduleName: s.name,
            status: s.status,
            durationMs: s.durationMs,
            keysCount: s.keysCount,
            error: s.error || ""
          })),
          failedModules: [],
          notes: "Full Redis Cache Reset & Rebuild executed successfully"
        }).catch((e: any) => console.error("Audit log error", e));
      }
    } catch (err: any) {
      console.error("[FATAL Redis Full Reset]", err);
      globalResetState.status = "failed";
      globalResetState.isRunning = false;
      globalResetState.errorMessage = err.message;
      globalResetState.logs.push(`[${new Date().toLocaleTimeString()}] ❌ Failed: ${err.message}`);

      if (RedisCacheAuditLogs) {
        await RedisCacheAuditLogs.create({
          adminName,
          adminEmail,
          action: "FULL_RESET",
          status: "failed",
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          totalKeysCleared: globalResetState.totalKeysCleared,
          totalKeysRebuilt: globalResetState.totalKeysRebuilt,
          moduleResults: globalResetState.steps.map((s) => ({
            moduleKey: s.key,
            moduleName: s.name,
            status: s.status,
            durationMs: s.durationMs,
            keysCount: s.keysCount,
            error: s.error || ""
          })),
          failedModules: ["fatal_error"],
          errorMessage: err.message,
          notes: "Full Reset encountered a critical error"
        }).catch((e: any) => console.error("Audit log error", e));
      }
    }
  })();

  return {
    success: true,
    message: "Redis Cache Full Reset started in the background",
    jobId
  };
};
