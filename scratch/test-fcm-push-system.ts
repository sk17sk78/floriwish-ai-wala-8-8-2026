import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";
import fs from "fs";
import path from "path";

const { NotificationTokens, PushNotificationLogs } = models;

async function runWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  throw new Error("Max retries exceeded");
}

async function testFCMSystem() {
  console.log("================================================================================");
  console.log("             TESTING FIREBASE CLOUD MESSAGING (FCM) SYSTEM");
  console.log("================================================================================\n");

  await connectDB();
  console.log("✅ 1. MongoDB connected successfully");

  // 1. Test NotificationToken Model & Schema
  const testTokenStr = "fcm_test_token_" + Date.now();
  const createdToken = await runWithRetry(() =>
    NotificationTokens.findOneAndUpdate(
      { token: testTokenStr },
      {
        $set: {
          token: testTokenStr,
          deviceInfo: "Automated Test Browser",
          userAgent: "Jest/Node Test Agent",
          platform: "web",
          isActive: true
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  );

  console.log(`✅ 2. NotificationToken Upsert Passed: ID = ${createdToken._id}`);

  // Test token retrieval
  const foundToken = await runWithRetry(() => NotificationTokens.findOne({ token: testTokenStr }));
  if (!foundToken || !foundToken.isActive) {
    throw new Error("Failed to find active token in DB");
  }
  console.log("✅ 3. Token Query & Active status verified");

  // 2. Test PushNotificationLog Model
  const createdLog = await runWithRetry(() =>
    PushNotificationLogs.create({
      title: "🌹 Test Broadcast Title",
      message: "Test message body for Floriwish push notification system.",
      imageUrl: "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp",
      clickUrl: "/flower",
      targetType: "all",
      totalSent: 1,
      successCount: 1,
      failureCount: 0
    })
  );

  console.log(`✅ 4. PushNotificationLogs Created: ID = ${createdLog._id}`);

  // 3. Test Stats Calculation
  const totalActive = await runWithRetry(() => NotificationTokens.countDocuments({ isActive: true }));
  const totalRegistered = await runWithRetry(() => NotificationTokens.countDocuments({ isActive: true, userId: { $ne: null } }));
  const totalGuests = await runWithRetry(() => NotificationTokens.countDocuments({ isActive: true, userId: null }));
  const campaignCount = await runWithRetry(() => PushNotificationLogs.countDocuments());

  console.log("\n--- FCM System Metrics ---");
  console.log(`  Total Active Subscriber Tokens: ${totalActive}`);
  console.log(`  Registered Customers Devices: ${totalRegistered}`);
  console.log(`  Guest Visitor Devices: ${totalGuests}`);
  console.log(`  Dispatched Campaigns in Log: ${campaignCount}`);

  // 4. Test Token Deactivation
  await runWithRetry(() =>
    NotificationTokens.updateOne(
      { token: testTokenStr },
      { $set: { isActive: false } }
    )
  );
  const deactivatedToken = await runWithRetry(() => NotificationTokens.findOne({ token: testTokenStr }));
  if (deactivatedToken?.isActive !== false) {
    throw new Error("Token deactivation failed");
  }
  console.log("\n✅ 5. Token Deactivation & Cleanup verified");

  // Clean up test token & log
  await runWithRetry(() => NotificationTokens.deleteOne({ token: testTokenStr }));
  await runWithRetry(() => PushNotificationLogs.deleteOne({ _id: createdLog._id }));
  console.log("✅ 6. Test records cleaned up successfully");

  // 5. Test Service Worker File
  const swPath = path.join(process.cwd(), "public", "firebase-messaging-sw.js");
  if (!fs.existsSync(swPath)) {
    throw new Error("public/firebase-messaging-sw.js is missing!");
  }
  const swContent = fs.readFileSync(swPath, "utf-8");
  if (!swContent.includes("firebase-messaging-compat.js") || !swContent.includes("notificationclick")) {
    throw new Error("Service worker missing critical FCM event handlers!");
  }
  console.log("✅ 7. public/firebase-messaging-sw.js verified with background & click handlers");

  console.log("\n================================================================================");
  console.log("               ALL FCM PUSH NOTIFICATION TESTS PASSED!");
  console.log("================================================================================");
  process.exit(0);
}

testFCMSystem().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
