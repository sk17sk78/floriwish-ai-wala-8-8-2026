const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY || '1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo';
const BASE_URL = 'http://localhost:3000';

const TEST_ENDPOINTS = [
  // --- 1. FRONTEND CORE & DISCOVERY ---
  { name: 'Homepage Feed', path: '/api/frontend/homepage', category: 'Frontend' },
  { name: 'Global Locations', path: '/api/frontend/location', category: 'Frontend' },
  { name: 'Global Website Settings', path: '/api/frontend/setting', category: 'Frontend' },
  { name: 'Search Initial Load Feed', path: '/api/frontend/v2/frontend/search/initial-load', category: 'Frontend' },
  { name: 'Search Contents Query (Cake)', path: '/api/frontend/v2/frontend/search/contents?q=cake', category: 'Frontend' },
  { name: 'Search Contents Query (Roses)', path: '/api/frontend/v2/frontend/search/contents?q=rose', category: 'Frontend' },
  { name: 'Merchant Center XML Feed', path: '/api/frontend/merchant-center', category: 'Frontend' },
  { name: 'Blog Articles Feed', path: '/api/frontend/blog', category: 'Frontend' },
  { name: 'Homepage Text Content', path: '/api/frontend/homepage/text-content', category: 'Frontend' },
  { name: 'Notifications Active Count', path: '/api/frontend/notifications', category: 'Frontend' },

  // --- 2. CATEGORY & DYNAMIC PAGE HIERARCHY ---
  { name: 'Category 1 (Content Category Catalog)', path: '/api/frontend/content-category-page', category: 'Catalog & Pages' },
  { name: 'Category 1 Slug (Cakes)', path: '/api/frontend/content-category-page/cakes', category: 'Catalog & Pages' },
  { name: 'Category 1 Slug (Flowers)', path: '/api/frontend/content-category-page/flowers', category: 'Catalog & Pages' },
  { name: 'Category 2 Topic Page (Cakes Rohtak)', path: '/api/frontend/topic-page/cakes/rohtak', category: 'Catalog & Pages' },
  { name: 'Category 2 Topic Page (Flowers Delhi)', path: '/api/frontend/topic-page/flowers/delhi', category: 'Catalog & Pages' },
  { name: 'Category 3 SubTopic Page (Wedding Delhi Dwarka)', path: '/api/frontend/sub-topic-page/wedding-house-decoration/delhi/dwarka', category: 'Catalog & Pages' },
  { name: 'V2 Content Category (Cakes)', path: '/api/frontend/v2/frontend/content-category/cakes', category: 'Catalog & Pages' },

  // --- 3. SITEMAPS & SEO ---
  { name: 'Sitemap Products Index', path: '/api/frontend/sitemap/products', category: 'SEO & Sitemaps' },
  { name: 'Sitemap Dynamic Pages Index', path: '/api/frontend/sitemap/dynamic-pages', category: 'SEO & Sitemaps' },

  // --- 4. ADMIN PRESETS & CORE ---
  { name: 'Admin Cities Preset', path: '/api/admin/preset/city?limit=10', category: 'Admin Presets' },
  { name: 'Admin Delivery Types', path: '/api/admin/preset/delivery-type', category: 'Admin Presets' },
  { name: 'Admin Occasions', path: '/api/admin/preset/occasion?active=true', category: 'Admin Presets' },
  { name: 'Admin Cancellation Policy', path: '/api/admin/preset/cancellation-policy', category: 'Admin Presets' },
  { name: 'Admin Colors Preset', path: '/api/admin/preset/color?limit=10', category: 'Admin Presets' },
  { name: 'Admin Care Info Preset', path: '/api/admin/preset/care-info?limit=5', category: 'Admin Presets' },
  { name: 'Admin Advance Payment', path: '/api/admin/preset/advance-payment', category: 'Admin Presets' },

  // --- 5. ADMIN CATALOG & CONTENT ---
  { name: 'Admin Products Stream', path: '/api/admin/content/content?type=product&limit=10', category: 'Admin Catalog' },
  { name: 'Admin Addon Products', path: '/api/admin/content/addon?limit=10', category: 'Admin Catalog' },
  { name: 'Admin Coupons & Discounts', path: '/api/admin/content/coupon?active=true', category: 'Admin Catalog' },
  { name: 'Admin Category Banners Manager', path: '/api/admin/category-banners', category: 'Admin Catalog' },
  { name: 'Admin Category Search (Live Index)', path: '/api/admin/category-banners/categories/search?q=&limit=10', category: 'Admin Catalog' },
  { name: 'Admin Catalogue Category Groups', path: '/api/admin/category/catalogue-category?limit=10', category: 'Admin Catalog' },
  { name: 'Admin Addon Category Groups', path: '/api/admin/category/addon-category?limit=10', category: 'Admin Catalog' },
  { name: 'Admin Content Category List', path: '/api/admin/category/content-category?limit=10', category: 'Admin Catalog' },
  { name: 'Admin Universal Search', path: '/api/admin/universal-search?q=cake', category: 'Admin Search' },

  // --- 6. ADMIN ORDERS, CARTS & USERS ---
  { name: 'Admin Orders Stream', path: '/api/admin/dynamic/order?limit=10', category: 'Admin Orders' },
  { name: 'Admin Active Shopping Carts', path: '/api/admin/dynamic/cart?limit=10', category: 'Admin Orders' },
  { name: 'Admin Registered Customers', path: '/api/admin/user/customer?limit=10', category: 'Admin Users' },
  { name: 'Admin Roles Table', path: '/api/admin/admin/admin-role?limit=10', category: 'Admin Staff' },

  // --- 7. ADMIN MEDIA & ASSETS ---
  { name: 'Admin Media Library Folders', path: '/api/admin/media/folder?limit=10', category: 'Admin Media' },
  { name: 'Admin Media Library Images', path: '/api/admin/media/image?limit=10', category: 'Admin Media' },

  // --- 8. SYSTEM HEALTH & SETTINGS ---
  { name: 'System Hardware & Telemetry', path: '/api/admin/system-health/system-status', category: 'Infrastructure' },
  { name: 'Homepage Studio Master Config', path: '/api/admin/homepage-management', category: 'Settings' },
  { name: 'Push Notifications Stats', path: '/api/admin/notifications/stats', category: 'Infrastructure' },
  { name: 'Cache Revalidation Module', path: '/api/admin/revalidate-cache/module', category: 'Infrastructure' },
];

async function runBenchmark() {
  console.log('🚀 Starting Full API Diagnostic & Performance Benchmark...\n');

  const results = [];
  const headers = {
    'x-api-key': API_KEY,
    'User-Agent': 'API-Benchmark-Runner/2.0',
    Accept: 'application/json, text/plain, */*',
  };

  // Run in parallel batches of 3
  const BATCH_SIZE = 3;
  for (let i = 0; i < TEST_ENDPOINTS.length; i += BATCH_SIZE) {
    const batch = TEST_ENDPOINTS.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (ep) => {
      const url = `${BASE_URL}${ep.path}`;
      const startTime = performance.now();
      let status = 0;
      let sizeBytes = 0;
      let error = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);

        const latency = Math.round(performance.now() - startTime);
        status = res.status;
        const text = await res.text();
        sizeBytes = Buffer.byteLength(text, 'utf8');

        if (!res.ok) {
          error = `HTTP ${status} (${text.slice(0, 100)})`;
        }

        return {
          ...ep,
          status,
          latency,
          sizeBytes,
          sizeFormatted: formatBytes(sizeBytes),
          error,
        };
      } catch (err) {
        const latency = Math.round(performance.now() - startTime);
        return {
          ...ep,
          status: err.name === 'AbortError' ? 408 : 500,
          latency,
          sizeBytes: 0,
          sizeFormatted: '0 B',
          error: err.message,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  // Categories
  const fastApis = results.filter((r) => r.status === 200 && r.latency < 500);
  const moderateApis = results.filter((r) => r.status === 200 && r.latency >= 500 && r.latency < 1200);
  const slowApis = results.filter((r) => r.status === 200 && r.latency >= 1200);
  const brokenApis = results.filter((r) => r.status !== 200);

  console.log('===============================================================');
  console.log('                 📊 FULL BENCHMARK RESULTS                     ');
  console.log('===============================================================');
  console.log(`Total Tested APIs: ${results.length}`);
  console.log(`⚡ Fast APIs (<500ms): ${fastApis.length}`);
  console.log(`⏱️ Moderate APIs (500ms - 1.2s): ${moderateApis.length}`);
  console.log(`🐢 Slow APIs (>1.2s): ${slowApis.length}`);
  console.log(`❌ Broken / Error APIs: ${brokenApis.length}\n`);

  console.log('--- 1. ⚡ FAST APIS (< 500ms) ---');
  fastApis.sort((a, b) => a.latency - b.latency).forEach((r) => {
    console.log(`🟢 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
  });

  console.log('\n--- 2. ⏱️ MODERATE APIS (500ms - 1200ms) ---');
  moderateApis.sort((a, b) => a.latency - b.latency).forEach((r) => {
    console.log(`🟡 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
  });

  console.log('\n--- 3. 🐢 SLOW APIS (>= 1200ms) ---');
  slowApis.sort((a, b) => b.latency - a.latency).forEach((r) => {
    console.log(`🔴 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
  });

  if (brokenApis.length > 0) {
    console.log('\n--- 4. ❌ BROKEN / ERROR APIS ---');
    brokenApis.forEach((r) => {
      console.log(`🚨 Status ${r.status} | ${r.name} (${r.path}) -> ${r.error}`);
    });
  } else {
    console.log('\n--- 4. ❌ BROKEN / ERROR APIS ---');
    console.log('🎉 None! 0 Broken APIs found.');
  }

  // Save results to scratch JSON for inspection
  fs.writeFileSync('./scratch/api-benchmark-report.json', JSON.stringify({ results, fastApis, moderateApis, slowApis, brokenApis }, null, 2));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

runBenchmark();
