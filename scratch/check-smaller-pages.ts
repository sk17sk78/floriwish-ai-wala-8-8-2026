import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

const { DynamicPages } = models;

async function checkSmallerPages() {
  await connectDB();
  const pages = await DynamicPages.find({ isActive: true }).select("name slug updatedAt").lean();
  console.log("=== Smaller Pages (DynamicPages) in Database ===");
  console.log(`Total Active Smaller Pages: ${pages.length}`);
  pages.forEach((p: any, idx: number) => {
    console.log(`${idx + 1}. Name: "${p.name}", Slug: "${p.slug}", UpdatedAt: ${p.updatedAt}`);
  });
  process.exit(0);
}

checkSmallerPages();
