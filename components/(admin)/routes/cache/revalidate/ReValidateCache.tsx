"use client";

import React from "react";
import {
  Layers,
  LayoutDashboard,
  PanelTop,
  PanelBottom,
  Grip,
  ShoppingBag,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Tag,
  BookOpen,
  Search,
  Settings,
  FileText,
  RefreshCw,
  Database
} from "lucide-react";

import RevalidateCacheButton from "./components/RevalidateCacheButton";
import { revalidateHeaderCache } from "./requests/revalidateHeaderCache";
import { revalidateFooterCache } from "./requests/revalidateFooterCache";
import { revalidateHomepageCache } from "./requests/revalidateHomepageCache";
import { revalidateCatalogueCategoriesCache } from "./requests/revalidateCatalogueCategoriesCache";
import { revalidateCategoriesSitemap } from "./requests/revalidateCategoriesSitemap";
import { revalidateProductsSitemap } from "./requests/revalidateProductsSitemap";
import { revalidateBlogsSitemap } from "./requests/revalidateBlogsSitemap";
import { revalidateImagesSitemap } from "./requests/revalidateImagesSitemap";

const revalidateModuleViaAPI = async (module: string) => {
  const res = await fetch("/api/admin/revalidate-cache/module", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to revalidate");
  }
  return true;
};

export default function RevalidateCache() {
  return (
    <div className="w-full min-h-screen bg-[#fafaf8] text-stone-900 pb-16 font-sans antialiased">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200/80 sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5e1628]/10 flex items-center justify-center text-[#5e1628]">
              <RefreshCw width={18} height={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Module Cache Refresh
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Refresh specific page or module cache independently without full Redis reset.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Core Pages & Navigation */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard width={16} height={16} className="text-[#5e1628]" />
            <h2 className="text-sm font-bold text-stone-900">Core Layout & Navigation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <RevalidateCacheButton
              type="cache"
              label="Homepage"
              icon={<LayoutDashboard width={15} height={15} />}
              onClick={revalidateHomepageCache}
            />
            <RevalidateCacheButton
              type="cache"
              label="Header Menu"
              icon={<PanelTop width={15} height={15} />}
              onClick={revalidateHeaderCache}
            />
            <RevalidateCacheButton
              type="cache"
              label="Footer Section"
              icon={<PanelBottom width={15} height={15} />}
              onClick={revalidateFooterCache}
            />
            <RevalidateCacheButton
              type="cache"
              label="Mobile Catalogue"
              icon={<Grip width={15} height={15} />}
              onClick={revalidateCatalogueCategoriesCache}
            />
          </div>
        </div>

        {/* Content & Commerce Modules */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag width={16} height={16} className="text-[#5e1628]" />
            <h2 className="text-sm font-bold text-stone-900">Content & Commerce Modules</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <RevalidateCacheButton
              type="cache"
              label="All Categories (1-5)"
              icon={<Layers width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("category1")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Product Catalog"
              icon={<ShoppingBag width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("product")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Category Banners"
              icon={<ImageIcon width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("categoryBanner")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Cities & Delivery"
              icon={<MapPin width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("city")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Blogs & Articles"
              icon={<BookOpen width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("blog")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Coupons & Offers"
              icon={<Tag width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("coupon")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Search Index"
              icon={<Search width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("search")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Store Settings"
              icon={<Settings width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("setting")}
            />
            <RevalidateCacheButton
              type="cache"
              label="Dynamic Pages"
              icon={<FileText width={15} height={15} />}
              onClick={() => revalidateModuleViaAPI("dynamicPage")}
            />
          </div>
        </div>

        {/* XML Sitemaps & Search Engines */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Database width={16} height={16} className="text-[#5e1628]" />
            <h2 className="text-sm font-bold text-stone-900">XML Sitemaps & Search Feeds</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <RevalidateCacheButton
              type="sitemap"
              label="Categories"
              icon={<Layers width={15} height={15} />}
              onClick={revalidateCategoriesSitemap}
            />
            <RevalidateCacheButton
              type="sitemap"
              label="Products"
              icon={<ShoppingBag width={15} height={15} />}
              onClick={revalidateProductsSitemap}
            />
            <RevalidateCacheButton
              type="sitemap"
              label="Blogs"
              icon={<BookOpen width={15} height={15} />}
              onClick={revalidateBlogsSitemap}
            />
            <RevalidateCacheButton
              type="sitemap"
              label="Images"
              icon={<ImageIcon width={15} height={15} />}
              onClick={revalidateImagesSitemap}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
