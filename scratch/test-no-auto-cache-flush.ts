import connectDB from "../db/mongoose/connection";
import { connectRedis } from "../db/redis/connection";
import { set, get } from "../db/redis/methods";
import { revalidateSingleModule } from "../lib/redis/revalidateModule";
import getHandler from "../common/utils/api/getHandler";
import models from "../db/mongoose/models";
import { NextRequest } from "next/server";
import dotenv from "dotenv";

dotenv.config();

async function connectWithRetry(retries = 5, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDB();
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function runTest() {
  console.log("🚀 Testing No-Automatic-Cache-Clear on Admin Updates...\n");

  await connectWithRetry();
  await connectRedis();
  const { Contents } = models;

  // 1. Find existing active product in DB
  const existingProduct = await Contents.findOne({ type: "product", isActive: true });
  if (!existingProduct) {
    throw new Error("No active product found in DB for test");
  }

  const testSlug = existingProduct.slug;
  const originalName = existingProduct.name;
  console.log(`✅ [1/5] Found test product in MongoDB (ID: ${existingProduct._id}, Slug: ${testSlug}, Name: '${originalName}')`);

  // 2. Populate Redis with cached version (public view)
  const cachedProductKey = `content_page_${testSlug}`;
  await set({ key: cachedProductKey, value: { name: originalName, slug: testSlug, cachedAt: Date.now() } });
  const redisBefore = await get({ key: cachedProductKey });
  console.log(`✅ [2/5] Cached product in Redis (Key: '${cachedProductKey}', Value exists: ${Boolean(redisBefore)})`);

  // 3. Update the product via getHandler (simulating Admin Edit)
  const handler = getHandler(Contents as any);
  const updateReq = new NextRequest(`http://localhost:3000/api/admin/content/product/${existingProduct._id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: `${originalName} (Edited In Admin)` })
  });

  await handler.updateDocument()(updateReq, { params: { id: String(existingProduct._id) } });
  console.log("✅ [3/5] Product updated in MongoDB via Admin getHandler.");

  // 4. Verify Redis Cache is STILL INTACT (NOT automatically cleared!)
  const redisAfterUpdate = await get({ key: cachedProductKey });
  if (redisAfterUpdate && (redisAfterUpdate as any).name === originalName) {
    console.log("✅ [4/5] VERIFIED: Redis cache was NOT automatically flushed on edit! Public site still sees cached version.");
  } else {
    throw new Error("❌ FAILED: Redis cache was unexpectedly cleared or flushed on save!");
  }

  // 5. Admin clicks Refresh icon (Explicit Revalidation)
  console.log("\n⚡ [5/5] Admin clicks the Refresh icon on the Product row...");
  const revalResult = await revalidateSingleModule({ module: "product", slug: testSlug });
  const redisAfterExplicitRefresh = await get({ key: cachedProductKey });

  if (revalResult.success && redisAfterExplicitRefresh === null) {
    console.log("✅ [5/5] VERIFIED: Cache cleared ONLY after clicking Refresh icon! New data is now published live.\n");
  } else {
    throw new Error("❌ Explicit refresh failed to purge cache.");
  }

  // Restore original product name in DB
  await Contents.updateOne({ _id: existingProduct._id }, { $set: { name: originalName } });
  console.log("🎉 ALL TESTS PASSED: Cache remains untouched on edit, and clears ONLY on explicit Refresh button click!\n");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
