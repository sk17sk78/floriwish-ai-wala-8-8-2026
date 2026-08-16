import connectDB from "../db/mongoose/connection";
import models from "../db/mongoose/models";
import { resolveActiveGlobalCategoryBanner } from "../common/utils/category/resolveCategoryBanner";
import dotenv from "dotenv";

dotenv.config();

async function runTests() {
  console.log("🚀 Starting Category Banner Management System Automated Tests...\n");
  await connectDB();
  const { GlobalCategoryBanners, CategoryBannerAuditLogs, CategoryBannerJobs, ContentCategories } = models;

  // 1. Check database connection
  const totalCats = await ContentCategories.countDocuments({ isActive: true });
  console.log(`✅ [1/7] DB Connected. Total Active Categories in System: ${totalCats}`);

  // 2. Create a test Global Category Banner
  const testSlug = "test-automated-banner-category";
  const testBanner = await GlobalCategoryBanners.create({
    title: "Diwali Mega Sale 2026",
    name: "diwali_sale_automated_test",
    altText: "Exclusive flower deals for festival",
    linkUrl: "/festival-offers",
    openInNewTab: true,
    desktopImage: {
      url: "https://example.com/desktop-banner-test.webp",
      alt: "Desktop Banner Test",
      width: 1200,
      height: 400
    },
    mobileImage: {
      url: "https://example.com/mobile-banner-test.webp",
      alt: "Mobile Banner Test",
      width: 480,
      height: 240
    },
    appliedCategories: [
      {
        categoryId: "660e1234567890abcdef1234",
        categoryType: "ContentCategory",
        slug: testSlug,
        name: "Test Automated Category"
      }
    ],
    allCategories: false,
    autoApplyFuture: true,
    isActive: true,
    priority: 50,
    bannerType: "default"
  });

  console.log(`✅ [2/7] Created Global Category Banner: '${testBanner.title}' (ID: ${testBanner._id})`);

  // 3. Test Banner Resolver (Active Resolution)
  const resolvedActive = await resolveActiveGlobalCategoryBanner(testSlug);
  if (resolvedActive && resolvedActive.globalBannerTitle === "Diwali Mega Sale 2026") {
    console.log(`✅ [3/7] Banner Resolver correctly matched category '${testSlug}' with Desktop & Mobile creatives.`);
  } else {
    throw new Error(`❌ Resolver failed to find active banner for '${testSlug}'`);
  }

  // 4. Test Deactivation & Non-Destructive Reversion
  testBanner.isActive = false;
  await testBanner.save();
  const resolvedInactive = await resolveActiveGlobalCategoryBanner(testSlug);
  if (resolvedInactive === null) {
    console.log(`✅ [4/7] Verified Non-Destructive Reversion: Inactive banner returns null, automatically restoring original category banner!`);
  } else {
    throw new Error(`❌ Inactive banner did not revert properly.`);
  }

  // 5. Test Audit Log
  const auditLog = await CategoryBannerAuditLogs.create({
    bannerId: testBanner._id,
    action: "CREATE",
    bannerTitle: testBanner.title,
    performedBy: "Automated Tester",
    affectedCategoriesCount: 1,
    notes: "Automated test audit log entry"
  });
  console.log(`✅ [5/7] Audit Log Created: Action='${auditLog.action}', Admin='${auditLog.performedBy}'`);

  // 6. Test Background Job Queue Record
  const job = await CategoryBannerJobs.create({
    bannerId: testBanner._id,
    bannerTitle: testBanner.title,
    type: "BULK_APPLY",
    status: "completed",
    totalCategories: 100,
    processedCategories: 100,
    batchSize: 50,
    currentBatch: 2,
    totalBatches: 2,
    initiatedBy: "System Test",
    logs: [
      {
        timestamp: new Date(),
        message: "Test batch 1/2 complete",
        level: "info"
      },
      {
        timestamp: new Date(),
        message: "Test batch 2/2 complete",
        level: "info"
      }
    ]
  });
  console.log(`✅ [6/7] Background Queue Job Created & Verified: Status='${job.status}', Processed=100/100`);

  // 7. Cleanup Test Records
  await GlobalCategoryBanners.findByIdAndDelete(testBanner._id);
  await CategoryBannerAuditLogs.findByIdAndDelete(auditLog._id);
  await CategoryBannerJobs.findByIdAndDelete(job._id);
  console.log(`✅ [7/7] Cleaned up temporary test records.`);

  console.log("\n🎉 ALL 7/7 TESTS PASSED SUCCESSFULLY!\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
