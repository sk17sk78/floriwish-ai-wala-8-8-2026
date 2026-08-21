import { NextRequest, NextResponse } from "next/server";
import { X_API_KEY } from "@/common/constants/environmentVariables";

export const dynamic = "force-dynamic";

interface RegisteredAPI {
  id: string;
  name: string;
  category: "Frontend Core" | "Search & Discovery" | "Categories & Catalog" | "Products & Content" | "Presets & Settings" | "Customer & Orders" | "SEO & Sitemaps" | "Media & Assets" | "Infrastructure";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description: string;
  critical: boolean;
}

const REGISTERED_APIS: RegisteredAPI[] = [
  // 1. Frontend Core
  {
    id: "frontend_homepage",
    name: "Homepage Layouts Feed",
    category: "Frontend Core",
    endpoint: "/api/frontend/homepage",
    method: "GET",
    description: "Fetches structured layouts, banners, and widgets for the public homepage",
    critical: true,
  },
  {
    id: "frontend_location",
    name: "Global Delivery Locations",
    category: "Frontend Core",
    endpoint: "/api/frontend/location",
    method: "GET",
    description: "Provides state and city serviceability data with aliases",
    critical: true,
  },
  {
    id: "frontend_setting",
    name: "Global Website Settings",
    category: "Frontend Core",
    endpoint: "/api/frontend/setting",
    method: "GET",
    description: "Returns platform branding, social links, contact info, and global toggles",
    critical: true,
  },
  {
    id: "frontend_merchant_center",
    name: "Google Merchant Center Feed",
    category: "Frontend Core",
    endpoint: "/api/frontend/merchant-center",
    method: "GET",
    description: "Generates real-time XML product feed for Google Shopping Ads",
    critical: false,
  },

  // 2. Search & Discovery
  {
    id: "search_initial_load",
    name: "Search Initial Load Feed",
    category: "Search & Discovery",
    endpoint: "/api/frontend/v2/frontend/search/initial-load",
    method: "GET",
    description: "Delivers trending searches, top categories, and quick suggestions on search focus",
    critical: true,
  },
  {
    id: "search_contents",
    name: "Search Contents Live Query",
    category: "Search & Discovery",
    endpoint: "/api/frontend/v2/frontend/search/contents?q=cake",
    method: "GET",
    description: "Performs full-text multi-token search across products, topics, and categories",
    critical: true,
  },
  {
    id: "universal_search_admin",
    name: "Admin Universal Search",
    category: "Search & Discovery",
    endpoint: "/api/admin/universal-search?q=rohtak",
    method: "GET",
    description: "Deep search across admin modules, pages, orders, and products",
    critical: false,
  },

  // 3. Categories & Catalog
  {
    id: "cat1_content_category",
    name: "Category 1 (Content Categories)",
    category: "Categories & Catalog",
    endpoint: "/api/frontend/content-category-page",
    method: "GET",
    description: "Top-level parent category catalog (Cakes, Flowers, Plants, etc.)",
    critical: true,
  },
  {
    id: "cat2_topic_page",
    name: "Category 2 (Topic Page - Cakes Rohtak)",
    category: "Categories & Catalog",
    endpoint: "/api/frontend/topic-page/cakes/rohtak",
    method: "GET",
    description: "Level 2 City-Topic dynamic page data with banners & product listings",
    critical: true,
  },
  {
    id: "cat3_subtopic_page",
    name: "Category 3 (SubTopic Page)",
    category: "Categories & Catalog",
    endpoint: "/api/frontend/sub-topic-page/wedding-house-decoration/delhi/dwarka",
    method: "GET",
    description: "Level 3 Local area page data with breadcrumbs and listings",
    critical: false,
  },
  {
    id: "admin_category_banners",
    name: "Category Banner Campaigns",
    category: "Categories & Catalog",
    endpoint: "/api/admin/category-banners",
    method: "GET",
    description: "Admin manager for sitewide and multi-category promotional banners",
    critical: true,
  },
  {
    id: "admin_category_search",
    name: "Category Hierarchy Catalog Search",
    category: "Categories & Catalog",
    endpoint: "/api/admin/category-banners/categories/search?q=&limit=10",
    method: "GET",
    description: "Real-time search index across Category 1, 2, 3, 4, 5, Mobile and Addon levels",
    critical: true,
  },
  {
    id: "admin_catalogue_categories",
    name: "Mobile Catalogue Categories",
    category: "Categories & Catalog",
    endpoint: "/api/admin/category/catalogue-category?limit=5",
    method: "GET",
    description: "Categories for mobile drawer and bottom navigation catalog",
    critical: false,
  },
  {
    id: "admin_addon_categories",
    name: "Addon Categories",
    category: "Categories & Catalog",
    endpoint: "/api/admin/category/addon-category?limit=5",
    method: "GET",
    description: "Upsell and checkout addon categories (Candles, Cards, Chocolates)",
    critical: false,
  },

  // 4. Products & Content
  {
    id: "admin_products",
    name: "Products Catalog Stream",
    category: "Products & Content",
    endpoint: "/api/admin/content/content?type=product&limit=5",
    method: "GET",
    description: "Main inventory products stream with variants and pricing",
    critical: true,
  },
  {
    id: "admin_addons",
    name: "Addon Products Stream",
    category: "Products & Content",
    endpoint: "/api/admin/content/addon?limit=5",
    method: "GET",
    description: "Addon product offerings and dynamic pricing rules",
    critical: false,
  },
  {
    id: "admin_coupons",
    name: "Active Coupons & Discounts",
    category: "Products & Content",
    endpoint: "/api/admin/content/coupon?active=true",
    method: "GET",
    description: "Promotional discount codes and minimum cart requirements",
    critical: true,
  },
  {
    id: "frontend_blog",
    name: "Blog Articles Feed",
    category: "Products & Content",
    endpoint: "/api/frontend/blog",
    method: "GET",
    description: "Editorial blog articles, SEO metadata, and author details",
    critical: false,
  },

  // 5. Presets & Settings
  {
    id: "preset_cities",
    name: "Cities Preset API",
    category: "Presets & Settings",
    endpoint: "/api/admin/preset/city?limit=5",
    method: "GET",
    description: "Configured deliverable cities, states, and postal codes",
    critical: true,
  },
  {
    id: "preset_delivery_types",
    name: "Delivery Types & Time Slots",
    category: "Presets & Settings",
    endpoint: "/api/admin/preset/delivery-type",
    method: "GET",
    description: "Delivery slots (Standard, Midnight, Express, Morning) & fee calculations",
    critical: true,
  },
  {
    id: "preset_occasions",
    name: "Occasions Preset",
    category: "Presets & Settings",
    endpoint: "/api/admin/preset/occasion?active=true",
    method: "GET",
    description: "Occasions metadata (Birthday, Anniversary, Valentine, etc.)",
    critical: false,
  },
  {
    id: "preset_cancellation",
    name: "Cancellation Policy Rules",
    category: "Presets & Settings",
    endpoint: "/api/admin/preset/cancellation-policy",
    method: "GET",
    description: "Refund terms, cancellation cut-off times, and policies",
    critical: false,
  },

  // 6. Customer, Orders & Cart
  {
    id: "admin_orders",
    name: "Customer Orders Stream",
    category: "Customer & Orders",
    endpoint: "/api/admin/dynamic/order?limit=5",
    method: "GET",
    description: "Real-time order processing stream and payment verification",
    critical: true,
  },
  {
    id: "admin_cart",
    name: "Active Shopping Carts",
    category: "Customer & Orders",
    endpoint: "/api/admin/dynamic/cart?limit=5",
    method: "GET",
    description: "Active shopping sessions, checkout funnels, and cart line items",
    critical: true,
  },
  {
    id: "admin_customers",
    name: "Registered Customers Feed",
    category: "Customer & Orders",
    endpoint: "/api/admin/user/customer?limit=5",
    method: "GET",
    description: "Customer accounts, address books, and order history",
    critical: false,
  },

  // 7. SEO & Sitemaps
  {
    id: "sitemap_products",
    name: "Products Sitemap Index",
    category: "SEO & Sitemaps",
    endpoint: "/api/frontend/sitemap/products",
    method: "GET",
    description: "Generates live dynamic XML sitemaps for all indexed product URLs",
    critical: false,
  },
  {
    id: "sitemap_dynamic_pages",
    name: "Dynamic Pages Sitemap",
    category: "SEO & Sitemaps",
    endpoint: "/api/frontend/sitemap/dynamic-pages",
    method: "GET",
    description: "Generates live dynamic XML sitemaps for categories and topic pages",
    critical: false,
  },

  // 8. Media & Assets
  {
    id: "media_folders",
    name: "Media Library Folders",
    category: "Media & Assets",
    endpoint: "/api/admin/media/folder?limit=5",
    method: "GET",
    description: "Folder organization hierarchy for banner, product, and blog images",
    critical: false,
  },
  {
    id: "media_images",
    name: "Media Library Image Documents",
    category: "Media & Assets",
    endpoint: "/api/admin/media/image?limit=5",
    method: "GET",
    description: "Uploaded image assets, CloudFront CDN URLs, and dimensional metadata",
    critical: true,
  },

  // 9. Infrastructure & Cache
  {
    id: "revalidate_cache_module",
    name: "Cache Revalidation Module",
    category: "Infrastructure",
    endpoint: "/api/admin/revalidate-cache/module",
    method: "GET",
    description: "On-demand cache revalidation for homepage, category, and topic routes",
    critical: true,
  },
  {
    id: "push_notifications_stats",
    name: "Push Notification Subscribers",
    category: "Infrastructure",
    endpoint: "/api/admin/notifications/stats",
    method: "GET",
    description: "FCM subscriber counts, campaign delivery rates, and device stats",
    critical: false,
  },
  {
    id: "system_health_status",
    name: "System Hardware & Runtime Health",
    category: "Infrastructure",
    endpoint: "/api/admin/system-health/system-status",
    method: "GET",
    description: "Node.js runtime, RAM, CPU load, and database ping latency",
    critical: true,
  },
];

export interface APIScanResult {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  method: string;
  description: string;
  critical: boolean;
  status: "healthy" | "slow" | "offline";
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  responseSizeFormatted: string;
  responseSizeBytes: number;
  timestamp: string;
  headers: Record<string, string>;
  preview: any;
  error?: string | null;
}

// In-memory Scan History Store
let scanHistoryStore: Array<{
  id: string;
  timestamp: string;
  durationMs: number;
  totalApis: number;
  workingCount: number;
  slowCount: number;
  failedCount: number;
  avgResponseTimeMs: number;
  resultsSummary: Array<{ id: string; name: string; endpoint: string; status: string; statusCode: number; responseTimeMs: number; error?: string }>;
}> = [];

// In-memory Failure Timeline
let failureTimelineStore: Array<{
  id: string;
  timestamp: string;
  apiName: string;
  endpoint: string;
  statusCode: number;
  error: string;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEndpointId = body.id || body.endpointId;
    const customEndpoint = body.customEndpoint;

    const origin = req.nextUrl.origin || "http://localhost:3000";

    // 1. Single API retry request
    if (targetEndpointId || customEndpoint) {
      let targetApi = REGISTERED_APIS.find((a) => a.id === targetEndpointId);
      if (!targetApi && customEndpoint) {
        targetApi = {
          id: `custom_${Date.now()}`,
          name: body.customName || "Custom API Probe",
          category: "Frontend Core",
          endpoint: customEndpoint.startsWith("/") ? customEndpoint : `/${customEndpoint}`,
          method: (body.method || "GET").toUpperCase(),
          description: "Custom user-defined API endpoint",
          critical: false,
        };
      }

      if (!targetApi) {
        return NextResponse.json({ success: false, error: "Target API not found in registry" }, { status: 404 });
      }

      const result = await probeEndpoint(targetApi, origin);

      // Record failure in timeline if failed
      if (result.status === "offline") {
        failureTimelineStore.unshift({
          id: `fail_${Date.now()}`,
          timestamp: new Date().toISOString(),
          apiName: result.name,
          endpoint: result.endpoint,
          statusCode: result.statusCode,
          error: result.error || `HTTP ${result.statusCode} Error`,
        });
        failureTimelineStore = failureTimelineStore.slice(0, 100);
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 2. Full Scan of All Registered APIs
    const scanStart = performance.now();
    const results: APIScanResult[] = [];

    // Probe in small controlled batches of 4 concurrent requests to prevent throttling
    const BATCH_SIZE = 4;
    for (let i = 0; i < REGISTERED_APIS.length; i += BATCH_SIZE) {
      const batch = REGISTERED_APIS.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((api) => probeEndpoint(api, origin)));
      results.push(...batchResults);
    }

    const scanDurationMs = Math.round(performance.now() - scanStart);

    // Compute Summary Stats
    const workingCount = results.filter((r) => r.status === "healthy").length;
    const slowCount = results.filter((r) => r.status === "slow").length;
    const failedCount = results.filter((r) => r.status === "offline").length;
    const totalResponseTime = results.reduce((acc, r) => acc + (r.responseTimeMs || 0), 0);
    const avgResponseTimeMs = results.length > 0 ? Math.round(totalResponseTime / results.length) : 0;

    const sortedByLatency = [...results].filter((r) => r.status !== "offline").sort((a, b) => a.responseTimeMs - b.responseTimeMs);
    const fastestApi = sortedByLatency[0] ? { name: sortedByLatency[0].name, timeMs: sortedByLatency[0].responseTimeMs, endpoint: sortedByLatency[0].endpoint } : null;
    const slowestApi = sortedByLatency.length > 0 ? { name: sortedByLatency[sortedByLatency.length - 1].name, timeMs: sortedByLatency[sortedByLatency.length - 1].responseTimeMs, endpoint: sortedByLatency[sortedByLatency.length - 1].endpoint } : null;

    const successRatePercent = results.length > 0 ? Math.round(((workingCount + slowCount) / results.length) * 100) : 100;

    const summary = {
      totalApis: results.length,
      workingCount,
      slowCount,
      failedCount,
      avgResponseTimeMs,
      scanDurationMs,
      fastestApi,
      slowestApi,
      successRatePercent,
      overallStatus: failedCount > 0 ? "critical" : slowCount > 2 ? "warning" : "healthy",
      timestamp: new Date().toISOString(),
    };

    // Record failures in timeline
    for (const r of results) {
      if (r.status === "offline") {
        failureTimelineStore.unshift({
          id: `fail_${Date.now()}_${r.id}`,
          timestamp: new Date().toISOString(),
          apiName: r.name,
          endpoint: r.endpoint,
          statusCode: r.statusCode,
          error: r.error || `HTTP ${r.statusCode} Error`,
        });
      }
    }
    failureTimelineStore = failureTimelineStore.slice(0, 100);

    // Record into scan history store
    scanHistoryStore.unshift({
      id: `scan_${Date.now()}`,
      timestamp: new Date().toISOString(),
      durationMs: scanDurationMs,
      totalApis: results.length,
      workingCount,
      slowCount,
      failedCount,
      avgResponseTimeMs,
      resultsSummary: results.map((r) => ({
        id: r.id,
        name: r.name,
        endpoint: r.endpoint,
        status: r.status,
        statusCode: r.statusCode,
        responseTimeMs: r.responseTimeMs,
        error: r.error || undefined,
      })),
    });
    scanHistoryStore = scanHistoryStore.slice(0, 50);

    return NextResponse.json({
      success: true,
      summary,
      results,
      history: scanHistoryStore.slice(0, 10),
      timeline: failureTimelineStore.slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Scanning failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Return registered endpoints catalogue and latest scan cache
  return NextResponse.json({
    success: true,
    catalog: REGISTERED_APIS,
    totalRegistered: REGISTERED_APIS.length,
    latestHistory: scanHistoryStore[0] || null,
    historyCount: scanHistoryStore.length,
    timeline: failureTimelineStore.slice(0, 20),
  });
}

// Single endpoint prober
async function probeEndpoint(api: RegisteredAPI, origin: string): Promise<APIScanResult> {
  const url = `${origin}${api.endpoint}`;
  const startTime = performance.now();
  let statusCode = 0;
  let statusText = "Pending";
  let responseSizeBytes = 0;
  let headers: Record<string, string> = {};
  let preview: any = null;
  let errorMessage: string | null = null;
  let responseTimeMs = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s safety timeout

    const res = await fetch(url, {
      method: api.method,
      headers: {
        "x-api-key": X_API_KEY,
        "User-Agent": "Floriwish-API-Health-Monitor/2.0",
        Accept: "application/json, text/plain, */*",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    responseTimeMs = Math.round(performance.now() - startTime);
    statusCode = res.status;
    statusText = res.statusText || (statusCode === 200 ? "OK" : "Error");

    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const contentType = res.headers.get("content-type") || "";
    const rawText = await res.text();
    responseSizeBytes = new Blob([rawText]).size;

    if (contentType.includes("application/json")) {
      try {
        preview = JSON.parse(rawText);
      } catch {
        preview = rawText.slice(0, 500);
      }
    } else {
      preview = rawText.slice(0, 500);
    }

    if (!res.ok) {
      errorMessage = typeof preview === "object" && preview?.error
        ? preview.error
        : `Server returned HTTP status ${statusCode}`;
    }
  } catch (err: any) {
    responseTimeMs = Math.round(performance.now() - startTime);
    statusCode = err.name === "AbortError" ? 408 : 500;
    statusText = err.name === "AbortError" ? "Timeout" : "Connection Refused / Failed";
    errorMessage = err.message || "Failed to reach endpoint";
  }

  const isSuccess = statusCode >= 200 && statusCode < 300;
  let status: "healthy" | "slow" | "offline" = "offline";
  if (isSuccess) {
    status = responseTimeMs >= 1000 ? "slow" : "healthy";
  }

  return {
    id: api.id,
    name: api.name,
    category: api.category,
    endpoint: api.endpoint,
    method: api.method,
    description: api.description,
    critical: api.critical,
    status,
    statusCode,
    statusText,
    responseTimeMs,
    responseSizeBytes,
    responseSizeFormatted: formatBytes(responseSizeBytes),
    timestamp: new Date().toISOString(),
    headers,
    preview,
    error: errorMessage,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
