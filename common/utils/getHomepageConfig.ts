import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";
import {
  COMPANY_META_DESCRIPTION,
  COMPANY_NAME,
  COMPANY_PRIMARY_BANNER,
  COMPANY_URL,
} from "@/common/constants/companyDetails";
import { CANONICAL_LINK } from "@/common/constants/meta";

export async function getHomepageConfig() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      const doc = await db.collection("homepage_admin_config").findOne({ key: "master_homepage" });
      if (doc && doc.config) {
        return doc.config;
      }
    }
  } catch (error) {
    console.error("Error loading homepage config from DB:", error);
  }

  // Default fallback
  return {
    seo: {
      pageTitle: "Send Flowers, Cakes & Personalised Gifts Online Across India",
      metaTitle: COMPANY_NAME,
      metaDescription: COMPANY_META_DESCRIPTION,
      metaKeywords: ["flower delivery", "cake online", "online gift delivery", "birthday cakes", "same day delivery", "anniversary gifts", "send flowers online"],
      canonicalUrl: CANONICAL_LINK || COMPANY_URL,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: COMPANY_NAME,
      ogDescription: COMPANY_META_DESCRIPTION,
      ogImage: COMPANY_PRIMARY_BANNER,
      twitterTitle: COMPANY_NAME,
      twitterDescription: COMPANY_META_DESCRIPTION,
      twitterImage: COMPANY_PRIMARY_BANNER,
      twitterCardType: "summary_large_image",
      structuredData: "",
      googleVerification: "",
    },
    sections: [],
    header: {
      announcementBar: {
        enabled: true,
        text: "🌸 Free Same-Day Delivery on orders above ₹499 | Use Code: FLORIWISH50",
      }
    }
  };
}
