import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";
import { connectRedis, redisClient } from "@/db/redis/redis-client";

export const dynamic = "force-dynamic";

// Default seed data for Homepage Management
const DEFAULT_HOMEPAGE_CONFIG = {
  seo: {
    pageTitle: "Send Flowers, Cakes & Personalised Gifts Online Across India",
    metaTitle: "Floriwish - Online Flower, Cake & Gift Delivery in 2 Hours",
    metaDescription: "Order fresh flowers, delicious designer cakes, customized gifts & plants online with same-day and midnight delivery across 450+ cities in India. 100% freshness guaranteed.",
    metaKeywords: ["flower delivery", "cake online", "online gift delivery", "birthday cakes", "same day delivery", "anniversary gifts", "send flowers online"],
    canonicalUrl: "https://floriwish.com",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "Floriwish - Deliver Smiles With Fresh Flowers & Cakes",
    ogDescription: "India's favorite online gifting portal for fresh blooms, delicious cakes, and thoughtful gifts.",
    ogImage: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
    twitterTitle: "Floriwish - Send Flowers & Cakes in 2 Hours",
    twitterDescription: "Express flower & cake delivery across India. Handcrafted arrangements & freshly baked delights.",
    twitterImage: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&auto=format&fit=crop&q=80",
    twitterCardType: "summary_large_image",
    structuredData: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Florist",
        "name": "Floriwish",
        "image": "https://floriwish.com/images/logo.png",
        "@id": "https://floriwish.com",
        "url": "https://floriwish.com",
        "telephone": "+91 98765 43210",
        "priceRange": "₹299 - ₹9999",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Sector 14",
          "addressLocality": "Rohtak",
          "addressRegion": "Haryana",
          "postalCode": "124001",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 28.8955,
          "longitude": 76.6066
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      },
      null,
      2
    ),
    googleVerification: "google-site-verification-floriwish-token-2026",
    bingVerification: "bing-webmaster-verification-floriwish-token",
    customHeadScripts: "<!-- Google Analytics & Meta Pixel -->\n<script>\n  console.log('Floriwish Head Script Loaded');\n</script>",
    customBodyScripts: "<!-- Live Chat & Support Scripts -->",
  },
  sections: [
    {
      id: "sec_hero",
      name: "Hero Banner Carousel",
      type: "hero_banner",
      subtitle: "Main promotional sliding hero banners",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 1,
      config: {
        autoPlay: true,
        intervalSeconds: 4,
        showNavigationDots: true,
        showArrows: true,
        bannerCount: 4,
      },
    },
    {
      id: "sec_categories",
      name: "Popular Categories Grid",
      type: "categories",
      subtitle: "Circular category icons (Cakes, Flowers, Plants, Chocolates)",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 2,
      config: {
        style: "circular",
        columns: 6,
        showTitle: true,
        title: "Explore by Category",
      },
    },
    {
      id: "sec_bestsellers",
      name: "Trending Bestsellers",
      type: "featured_products",
      subtitle: "Top purchased cakes and floral bouquets",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 3,
      config: {
        title: "Trending Bestsellers",
        subtitle: "Handpicked by our expert florists and bakers",
        itemLimit: 8,
        badgeText: "BESTSELLER",
      },
    },
    {
      id: "sec_occasions",
      name: "Occasion Specials",
      type: "occasions",
      subtitle: "Curated gifts for Birthday, Anniversary, Romance",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 4,
      config: {
        title: "Celebrate Every Occasion",
        layout: "cards_grid",
      },
    },
    {
      id: "sec_testimonials",
      name: "Customer Reviews & Ratings",
      type: "testimonials",
      subtitle: "Real verified customer reviews and 4.9★ rating badge",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 5,
      config: {
        title: "Loved by Over 50,000+ Happy Customers",
        rating: 4.9,
        reviewsCount: 14200,
      },
    },
    {
      id: "sec_blogs",
      name: "Latest Gifting Guides & Blogs",
      type: "blogs",
      subtitle: "Editorial articles, gift recommendations, care tips",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 6,
      config: {
        title: "From Our Journal",
        postLimit: 4,
      },
    },
    {
      id: "sec_trust",
      name: "Why Choose Floriwish",
      type: "trust_badges",
      subtitle: "2-Hour Express, 100% Fresh Guarantee, Secure Checkout",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 7,
      config: {
        badges: ["2-Hour Delivery", "Freshness Guaranteed", "100% Secure Payments", "450+ Cities"],
      },
    },
    {
      id: "sec_faqs",
      name: "Frequently Asked Questions",
      type: "faqs",
      subtitle: "Common queries regarding delivery, cancellation, midnight slots",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 8,
      config: {
        title: "Frequently Asked Questions",
        expandFirst: true,
      },
    },
    {
      id: "sec_about",
      name: "Floriwish SEO Story",
      type: "about",
      subtitle: "Rich text narrative for search engine authority",
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: 9,
      config: {
        heading: "Floriwish - India's Favorite Online Gifting & Flower Delivery Platform",
      },
    },
  ],
  header: {
    logoUrl: "/images/logo.png",
    logoWidth: 155,
    logoHeight: 40,
    isSticky: true,
    isTransparent: false,
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    hoverColor: "#5e1628",
    headerHeight: 70,
    headerShadow: "subtle",
    announcementBar: {
      enabled: true,
      scrolling: true,
      text: "🌸 Free Same-Day Delivery on orders above ₹499 | Use Code: FLORIWISH50",
      bgColor: "#5e1628",
      textColor: "#ffffff",
      ctaText: "Shop Now",
      ctaLink: "/cakes",
    },
    navIcons: {
      search: true,
      wishlist: true,
      cart: true,
      account: true,
      location: true,
      currency: false,
      language: false,
      notification: true,
    },
    megaMenu: [
      {
        id: "menu_cakes",
        label: "Cakes",
        path: "/cakes",
        badge: "HOT",
        badgeColor: "rose",
        submenus: [
          { label: "Birthday Cakes", path: "/cakes/birthday" },
          { label: "Anniversary Cakes", path: "/cakes/anniversary" },
          { label: "Designer Photo Cakes", path: "/cakes/photo-cakes" },
          { label: "Chocolate Truffle", path: "/cakes/chocolate" },
          { label: "Eggless Cakes", path: "/cakes/eggless" },
        ],
      },
      {
        id: "menu_flowers",
        label: "Flowers",
        path: "/flowers",
        badge: "FRESH",
        badgeColor: "emerald",
        submenus: [
          { label: "Red Roses Bouquets", path: "/flowers/roses" },
          { label: "Exotic Orchids & Lilies", path: "/flowers/orchids" },
          { label: "Carnations & Mixed Blooms", path: "/flowers/carnations" },
          { label: "Flower Box Arrangements", path: "/flowers/boxes" },
        ],
      },
      {
        id: "menu_combos",
        label: "Combos & Hampers",
        path: "/combos",
        badge: "POPULAR",
        badgeColor: "amber",
        submenus: [
          { label: "Flowers & Cakes Combo", path: "/combos/flowers-and-cakes" },
          { label: "Flowers & Chocolates", path: "/combos/flowers-and-chocolates" },
          { label: "Teddy & Bloom Sets", path: "/combos/teddy-combos" },
        ],
      },
      {
        id: "menu_plants",
        label: "Plants",
        path: "/plants",
        badge: null,
        badgeColor: null,
        submenus: [
          { label: "Indoor Air Purifying", path: "/plants/indoor" },
          { label: "Lucky Bamboo", path: "/plants/lucky-bamboo" },
          { label: "Bonsai & Succulents", path: "/plants/bonsai" },
        ],
      },
      {
        id: "menu_occasions",
        label: "Occasions",
        path: "/occasions",
        badge: "NEW",
        badgeColor: "purple",
        submenus: [
          { label: "Birthday Celebrations", path: "/occasions/birthday" },
          { label: "Wedding & Anniversary", path: "/occasions/anniversary" },
          { label: "Valentine's Special", path: "/occasions/valentines" },
          { label: "Get Well Soon", path: "/occasions/get-well-soon" },
        ],
      },
    ],
  },
  footer: {
    layout: "4_column",
    companyInfo: {
      name: "Floriwish Online Services Pvt Ltd",
      bio: "India's premier floral and gifting destination delivering happiness across 450+ cities with guaranteed same-day and midnight delivery.",
      address: "Sector 14, Rohtak, Haryana 124001",
      phone: "+91 98765 43210",
      email: "support@floriwish.com",
      workingHours: "24/7 Support Available",
    },
    quickLinks: {
      categories: true,
      occasions: true,
      cities: true,
      states: true,
    },
    policies: {
      support: true,
      faq: true,
      contact: true,
      returns: true,
      cancellation: true,
      refund: true,
      privacy: true,
      terms: true,
    },
    socialLinks: {
      facebook: "https://facebook.com/floriwish",
      instagram: "https://instagram.com/floriwish",
      youtube: "https://youtube.com/@floriwish",
      twitter: "https://twitter.com/floriwish",
      linkedin: "https://linkedin.com/company/floriwish",
      pinterest: "https://pinterest.com/floriwish",
      whatsapp: "+919876543210",
    },
    paymentIcons: {
      visa: true,
      mastercard: true,
      upi: true,
      rupay: true,
      paytm: true,
      gpay: true,
      phonepe: true,
    },
    newsletter: {
      enabled: true,
      title: "Stay in the Bloom",
      subtitle: "Subscribe to receive special offers, gifting guides, and exclusive discounts.",
      placeholder: "Enter your email address...",
      buttonText: "Subscribe",
    },
    copyright: "© {year} Floriwish. All rights reserved. Handcrafted with love in India.",
    styling: {
      bgColor: "#0f172a",
      textColor: "#94a3b8",
      linkColor: "#cbd5e1",
      hoverColor: "#f43f5e",
    },
  },
  advanced: {
    slug: "/",
    pageStatus: "published",
    password: "",
    lastPublishedAt: new Date().toISOString(),
    versionHistory: [
      {
        version: "v1.4",
        publishedAt: new Date().toISOString(),
        author: "Super Admin",
        changes: "Updated SEO Meta, Hero Banner autoplay, and Mega Menu structure",
      },
      {
        version: "v1.3",
        publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        author: "Admin Team",
        changes: "Added Festive Announcement Bar and revised Trust Badges",
      },
      {
        version: "v1.2",
        publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        author: "System Architect",
        changes: "Initial Homepage Redesign and Mega Menu launch",
      },
    ],
    activityLogs: [
      {
        id: "act_1",
        author: "Super Admin",
        timestamp: new Date().toISOString(),
        action: "Published Homepage Live",
        section: "All Sections",
      },
      {
        id: "act_2",
        author: "Admin Team",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        action: "Updated Mega Menu categories",
        section: "Header Management",
      },
      {
        id: "act_3",
        author: "Admin Team",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        action: "Optimized SEO Meta Description",
        section: "Homepage SEO",
      },
    ],
  },
};

// In-memory or MongoDB backed store
let activeConfigStore = { ...DEFAULT_HOMEPAGE_CONFIG };

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    if (db) {
      const savedDoc = await db.collection("homepage_admin_config").findOne({ key: "master_homepage" });
      if (savedDoc && savedDoc.config) {
        activeConfigStore = savedDoc.config;
      }
    }

    return NextResponse.json({
      success: true,
      data: activeConfigStore,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: activeConfigStore,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const newConfig = body.config || body;
    const author = body.author || "Super Admin";
    const publishLive = body.publishLive ?? true;
    const changesSummary = body.changesSummary || "Updated homepage configurations";

    await connectDB();
    const db = mongoose.connection.db;

    // Create version snapshot if publishing
    if (publishLive) {
      const newVersion = `v1.${(activeConfigStore.advanced?.versionHistory?.length || 3) + 2}`;
      const versionEntry = {
        version: newVersion,
        publishedAt: new Date().toISOString(),
        author,
        changes: changesSummary,
      };

      if (!newConfig.advanced) newConfig.advanced = {};
      if (!newConfig.advanced.versionHistory) newConfig.advanced.versionHistory = [];
      newConfig.advanced.versionHistory.unshift(versionEntry);
      newConfig.advanced.versionHistory = newConfig.advanced.versionHistory.slice(0, 15);
      newConfig.advanced.lastPublishedAt = new Date().toISOString();

      // Add Activity Log
      if (!newConfig.advanced.activityLogs) newConfig.advanced.activityLogs = [];
      newConfig.advanced.activityLogs.unshift({
        id: `act_${Date.now()}`,
        author,
        timestamp: new Date().toISOString(),
        action: publishLive ? "Published Live" : "Saved Draft",
        section: body.activeTabName || "Homepage",
      });
      newConfig.advanced.activityLogs = newConfig.advanced.activityLogs.slice(0, 30);
    }

    activeConfigStore = newConfig;

    // Save to MongoDB collection
    if (db) {
      await db.collection("homepage_admin_config").updateOne(
        { key: "master_homepage" },
        {
          $set: {
            key: "master_homepage",
            config: activeConfigStore,
            updatedAt: new Date(),
            updatedBy: author,
          },
        },
        { upsert: true }
      );
    }

    // Flush Redis Homepage & Setting Cache
    try {
      await connectRedis();
      if (redisClient.isOpen) {
        await redisClient.del("homepage");
        await redisClient.del("setting");
        await redisClient.del("search_initial_load");
      }
    } catch (rErr) {
      console.warn("Redis flush warning:", rErr);
    }

    return NextResponse.json({
      success: true,
      message: publishLive ? "Homepage published live successfully!" : "Draft saved successfully!",
      data: activeConfigStore,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to save homepage settings" }, { status: 500 });
  }
}
