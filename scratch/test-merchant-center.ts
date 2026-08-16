import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";
import { getMerchantCenterData } from "@/app/api/frontend/merchant-center/controller";

async function testGMC() {
  console.log("==========================================");
  console.log("     TESTING GOOGLE MERCHANT CENTER FEED");
  console.log("==========================================\n");

  await connectDB();

  const products = await getMerchantCenterData();
  console.log(`✅ Total Products in GMC Feed: ${products.length}`);

  if (products.length === 0) {
    console.error("❌ No products generated for GMC feed!");
    process.exit(1);
  }

  // Audit first 5 sample products
  console.log("\n--- Sample Product Entries (First 3) ---");
  for (let i = 0; i < Math.min(3, products.length); i++) {
    console.log(`\nProduct #${i + 1}:`);
    console.log(`  ID (SKU):`, products[i].id);
    console.log(`  Title:`, products[i].title);
    console.log(`  Link:`, products[i].link);
    console.log(`  Image Link:`, products[i].image_link);
    console.log(`  Price:`, products[i].price);
    console.log(`  Availability:`, products[i].availability);
    console.log(`  Google Category:`, products[i].google_product_category);
    console.log(`  Brand:`, products[i].brand);
    console.log(`  Shipping:`, products[i].shipping);
  }

  // Check data quality
  let missingImages = 0;
  let missingPrices = 0;
  let missingLinks = 0;
  let missingSkus = 0;

  products.forEach((p) => {
    if (!p.image_link || !p.image_link.startsWith("http")) missingImages++;
    if (!p.price || p.price.startsWith("0.00") || p.price.startsWith("NaN")) missingPrices++;
    if (!p.link || !p.link.startsWith("http")) missingLinks++;
    if (!p.id) missingSkus++;
  });

  console.log("\n--- GMC Feed Quality & Compliance Check ---");
  console.log(`  Missing / Invalid Image URLs: ${missingImages}`);
  console.log(`  Zero / Invalid Prices: ${missingPrices}`);
  console.log(`  Invalid Product Links: ${missingLinks}`);
  console.log(`  Missing SKUs: ${missingSkus}`);

  console.log("\n==========================================");
  console.log("   GMC AUDIT COMPLETE");
  console.log("==========================================");
  process.exit(0);
}

testGMC();
