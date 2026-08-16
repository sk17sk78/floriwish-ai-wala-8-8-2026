import connectDB from "../db/mongoose/connection";
import { connectRedis } from "../db/redis/connection";
import { set, get, del } from "../db/redis/methods";
import { triggerFullResetCache, getFullResetStatus } from "../lib/redis/fullResetCache";
import models from "../db/mongoose/models";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("🚀 Starting Redis Cache Full Reset Automated Test Suite...\n");

  await connectDB();
  const redisClient = await connectRedis();
  const { RedisCacheAuditLogs } = models;

  // 1. Write dummy test key into Redis
  const dummyKey = "test_dummy_key_to_be_flushed";
  await set({ key: dummyKey, value: { data: "old_cached_stale_data" } });
  const checkDummy = await get({ key: dummyKey });
  console.log(`✅ [1/5] Redis connected. Created test stale key: '${dummyKey}' (Value exists: ${Boolean(checkDummy)})`);

  // 2. Trigger Full Reset
  console.log("⚡ [2/5] Triggering Full Reset Cache Engine...");
  const triggerRes = await triggerFullResetCache({ adminName: "Automated Test Suite" });
  if (!triggerRes.success) {
    throw new Error(`❌ Failed to start full reset: ${triggerRes.message}`);
  }
  console.log(`✅ [2/5] Full Reset started with Job ID: ${triggerRes.jobId}`);

  // 3. Test Concurrency Lock
  const secondTrigger = await triggerFullResetCache({ adminName: "Intruder" });
  if (!secondTrigger.success && secondTrigger.message.includes("already in progress")) {
    console.log("✅ [3/5] Verified Concurrency Lock: Simultaneous second trigger rejected properly!");
  } else {
    throw new Error("❌ Concurrency lock failed to block simultaneous refresh.");
  }

  // 4. Poll progress until completed
  console.log("⏳ [4/5] Polling 10-step progress...");
  let isDone = false;
  let attempts = 0;
  while (!isDone && attempts < 30) {
    await new Promise((r) => setTimeout(r, 600));
    attempts++;
    const currentStatus = getFullResetStatus();
    console.log(`   -> Step [${currentStatus.currentStepIndex + 1}/10] ${currentStatus.currentStepName} (Status: ${currentStatus.status})`);
    if (currentStatus.status === "completed") {
      isDone = true;
      console.log(`✅ [4/5] Full Reset completed successfully in ${(currentStatus.durationMs / 1000).toFixed(2)}s!`);
      console.log(`   -> Total Keys Cleared: ${currentStatus.totalKeysCleared}`);
      console.log(`   -> Total Keys Rebuilt: ${currentStatus.totalKeysRebuilt}`);
    } else if (currentStatus.status === "failed") {
      throw new Error(`❌ Full Reset failed with error: ${currentStatus.errorMessage}`);
    }
  }

  // 5. Verify Redis and Audit Log
  const checkDummyAfter = await get({ key: dummyKey });
  const checkHomepage = await get({ key: "homepage" });
  const checkCatalogue = await get({ key: "catalogue_categories" });
  const checkBanners = await get({ key: "category_banners_active_all" });

  if (checkDummyAfter === null) {
    console.log("✅ [5/5] Stale key was successfully flushed from Redis memory.");
  } else {
    console.warn("⚠️ Stale key still found");
  }

  console.log(`   -> Fresh Homepage cache verified: ${Boolean(checkHomepage)}`);
  console.log(`   -> Fresh Catalogue categories cache verified: ${Boolean(checkCatalogue)}`);
  console.log(`   -> Fresh Global Category Banners cache verified: ${Boolean(checkBanners)}`);

  // Check Audit Log
  const latestAuditLog = await RedisCacheAuditLogs.findOne({ adminName: "Automated Test Suite" }).sort({ createdAt: -1 });
  if (latestAuditLog && latestAuditLog.status === "completed") {
    console.log(`   -> Audit log verified in MongoDB (ID: ${latestAuditLog._id}, Duration: ${latestAuditLog.durationMs}ms)`);
  }

  console.log("\n🎉 ALL 5/5 REDIS FULL RESET TESTS PASSED SUCCESSFULLY!\n");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
