import connectDB from "../db/mongoose/connection";
import { connectRedis } from "../db/redis/connection";
import { set, get } from "../db/redis/methods";
import { revalidateSingleModule } from "../lib/redis/revalidateModule";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("🚀 Starting Individual Module Cache Revalidation Test Suite...\n");

  await connectDB();
  await connectRedis();

  // 1. Test Product Revalidation
  console.log("🧪 [1/6] Testing Product Revalidation (Single Item)...");
  const testProductSlug = "test-red-rose-bouquet";
  await set({ key: `content_page_${testProductSlug}`, value: { name: "Old Cached Stale Product" } });
  await set({ key: `content_page_meta_${testProductSlug}`, value: { title: "Old Meta" } });
  const checkStaleProd = await get({ key: `content_page_${testProductSlug}` });
  console.log(`   -> Created stale product cache key (Exists: ${Boolean(checkStaleProd)})`);

  const prodResult = await revalidateSingleModule({ module: "product", slug: testProductSlug });
  const checkAfterProd = await get({ key: `content_page_${testProductSlug}` });
  if (prodResult.success && checkAfterProd === null) {
    console.log("✅ [1/6] Product cache revalidated successfully (Stale key purged)!");
  } else {
    throw new Error("❌ Product cache revalidation failed");
  }

  // 2. Test Category 1 Revalidation
  console.log("\n🧪 [2/6] Testing Category 1 Revalidation...");
  const testCatSlug = "test-birthday-cakes";
  await set({ key: `content_category_page_${testCatSlug}`, value: { name: "Old Category" } });
  const catResult = await revalidateSingleModule({ module: "category1", slug: testCatSlug });
  const checkAfterCat = await get({ key: `content_category_page_${testCatSlug}` });
  if (catResult.success && checkAfterCat === null) {
    console.log("✅ [2/6] Category 1 cache revalidated successfully!");
  } else {
    throw new Error("❌ Category 1 cache revalidation failed");
  }

  // 3. Test Category 2 (Topic) Revalidation
  console.log("\n🧪 [3/6] Testing Category 2 (Topic) Revalidation...");
  const testTopicKey = "topic_page_cakes_chocolate-truffle";
  await set({ key: testTopicKey, value: { name: "Old Topic" } });
  const topicResult = await revalidateSingleModule({
    module: "category2",
    categorySlug: "cakes",
    topicSlug: "chocolate-truffle"
  });
  const checkAfterTopic = await get({ key: testTopicKey });
  if (topicResult.success && checkAfterTopic === null) {
    console.log("✅ [3/6] Topic (Category 2) cache revalidated successfully!");
  } else {
    throw new Error("❌ Topic cache revalidation failed");
  }

  // 4. Test Blog Revalidation
  console.log("\n🧪 [4/6] Testing Blog Article Revalidation...");
  const testBlogSlug = "top-10-anniversary-gift-ideas";
  await set({ key: `blog_${testBlogSlug}`, value: { title: "Old Blog" } });
  const blogResult = await revalidateSingleModule({ module: "blog", slug: testBlogSlug });
  const checkAfterBlog = await get({ key: `blog_${testBlogSlug}` });
  if (blogResult.success && checkAfterBlog === null) {
    console.log("✅ [4/6] Blog article cache revalidated successfully!");
  } else {
    throw new Error("❌ Blog cache revalidation failed");
  }

  // 5. Test Homepage Revalidation
  console.log("\n🧪 [5/6] Testing Homepage Revalidation & Auto-Warm...");
  const hpResult = await revalidateSingleModule({ module: "homepage" });
  const checkAfterHp = await get({ key: "homepage" });
  if (hpResult.success && checkAfterHp !== null) {
    console.log(`✅ [5/6] Homepage cache revalidated and freshly re-warmed (${(checkAfterHp as any).length} layouts)!`);
  } else {
    throw new Error("❌ Homepage cache revalidation failed");
  }

  // 6. Test Category Banners & Cities Revalidation
  console.log("\n🧪 [6/6] Testing Banners & Cities Revalidation...");
  const bannerResult = await revalidateSingleModule({ module: "categoryBanner" });
  const cityResult = await revalidateSingleModule({ module: "city" });
  if (bannerResult.success && cityResult.success) {
    console.log("✅ [6/6] Category Banners and Cities revalidated successfully!");
  } else {
    throw new Error("❌ Banners/Cities cache revalidation failed");
  }

  console.log("\n🎉 ALL 6/6 INDIVIDUAL MODULE REVALIDATION TESTS PASSED!\n");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
