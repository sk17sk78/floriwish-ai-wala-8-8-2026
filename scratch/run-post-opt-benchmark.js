const fs = require('fs');
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
  { name: 'Homepage Text Content (Fixed)', path: '/api/frontend/homepage/text-content', category: 'Frontend' },
  { name: 'Notifications Status (Fixed)', path: '/api/frontend/notifications', category: 'Frontend' },

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
  { name: 'Admin Roles Preset (Fixed)', path: '/api/admin/preset/admin-role?limit=10', category: 'Admin Staff' },

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

  // --- 7. ADMIN MEDIA & ASSETS ---
  { name: 'Admin Media Library Folders', path: '/api/admin/media/folder?limit=10', category: 'Admin Media' },
  { name: 'Admin Media Library Images', path: '/api/admin/media/image?limit=10', category: 'Admin Media' },

  // --- 8. SYSTEM HEALTH & SETTINGS ---
  { name: 'Homepage Studio Master Config', path: '/api/admin/homepage-management', category: 'Settings' },
  { name: 'Push Notifications Stats', path: '/api/admin/notifications/stats', category: 'Infrastructure' },
  { name: 'Cache Revalidation Module', path: '/api/admin/revalidate-cache/module', category: 'Infrastructure' },
];

async function runBenchmark() {
  console.log('🚀 Running Post-Optimization API Benchmark...\n');

  const results = [];
  const headers = {
    'x-api-key': API_KEY,
    'User-Agent': 'API-Benchmark-Runner/2.0',
    Accept: 'application/json, text/plain, */*',
  };

  // Run in sequential batches of 2
  const BATCH_SIZE = 2;
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
        const res = await fetch(url, { headers, signal: controller.signal });
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
  const excellentApis = results.filter((r) => r.status === 200 && r.latency < 250);
  const fastApis = results.filter((r) => r.status === 200 && r.latency >= 250 && r.latency < 600);
  const moderateApis = results.filter((r) => r.status === 200 && r.latency >= 600);
  const brokenApis = results.filter((r) => r.status !== 200);

  console.log('===============================================================');
  console.log('            🏆 POST-OPTIMIZATION BENCHMARK REPORT              ');
  console.log('===============================================================');
  console.log(`Total Tested APIs: ${results.length}`);
  console.log(`⚡⚡ Excellent Performance (< 250ms): ${excellentApis.length}`);
  console.log(`⚡ Fast Performance (250ms - 600ms): ${fastApis.length}`);
  console.log(`⏱️ Moderate Performance (> 600ms): ${moderateApis.length}`);
  console.log(`❌ Broken / Error APIs: ${brokenApis.length}\n`);

  console.log('--- 1. ⚡⚡ EXCELLENT PERFORMANCE (< 250ms) ---');
  excellentApis.sort((a, b) => a.latency - b.latency).forEach((r) => {
    console.log(`🟢 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
  });

  console.log('\n--- 2. ⚡ FAST PERFORMANCE (250ms - 600ms) ---');
  fastApis.sort((a, b) => a.latency - b.latency).forEach((r) => {
    console.log(`🟢 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
  });

  if (moderateApis.length > 0) {
    console.log('\n--- 3. ⏱️ MODERATE APIS (> 600ms) ---');
    moderateApis.sort((a, b) => a.latency - b.latency).forEach((r) => {
      console.log(`🟡 ${r.latency}ms [${r.sizeFormatted}] ${r.name} (${r.path})`);
    });
  }

  console.log('\n--- 4. ❌ BROKEN / ERROR APIS ---');
  if (brokenApis.length > 0) {
    brokenApis.forEach((r) => {
      console.log(`🚨 Status ${r.status} | ${r.name} (${r.path}) -> ${r.error}`);
    });
  } else {
    console.log('🎉 0 Errors! 100% of tested endpoints returned 200 OK!');
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

runBenchmark();
