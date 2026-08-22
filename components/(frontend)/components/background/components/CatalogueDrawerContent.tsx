"use client";

// requests
import { fetchCatalogueCategories } from "@/request/catalogueCategories/catalogueCategories";

// utils
import { memo, useEffect, useState, useCallback } from "react";
import { type CatalogueCategoryDocument } from "@/common/types/documentation/categories/catalogueCategory";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { CatalogueDocument } from "@/common/types/documentation/presets/catalogue";
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";
import { Shapes, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

/**
 * Normalizes any external or absolute paths into clean Next.js relative routes
 * e.g. "https://floriwish.com/flowers" -> "/flowers"
 */
function normalizePath(rawPath?: string): string {
  if (!rawPath) return "/";
  try {
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      const parsed = new URL(rawPath);
      return parsed.pathname + parsed.search;
    }
  } catch {
    return rawPath.replace(/^https?:\/\/[^\/]+/, "") || "/";
  }
  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
}

function CatalogueDrawerContent({ onClose }: { onClose?: () => void }) {
  const [catalogueCategories, setCatalogueCategories] = useState<CatalogueCategoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      const response = await fetchCatalogueCategories();
      const categoriesData = (response?.data as CatalogueCategoryDocument[]) || [];
      setCatalogueCategories(categoriesData);
    } catch (error) {
      console.warn("[CatalogueDrawer] Error fetching categories:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Collect all active catalogues from all categories
  const catalogues = catalogueCategories.reduce<CatalogueDocument[]>((acc, category) => {
    const categoryCatalogues = (category._catalogues as CatalogueDocument[]) || [];
    return [...acc, ...categoryCatalogues];
  }, []);

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#b76e79]/10 text-[#b76e79] flex items-center justify-center">
            <Shapes className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 tracking-tight leading-tight">
              Explore Categories
            </h3>
            <p className="text-[11px] text-zinc-400">
              {catalogues.length > 0
                ? `${catalogues.length} celebration categories`
                : "Handcrafted for every celebration"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 overscroll-contain">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-zinc-50/70 animate-pulse"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-200/80" />
                <div className="w-14 h-3 rounded-md bg-zinc-200/80" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">
              Unable to load categories
            </p>
            <p className="text-xs text-zinc-500">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={loadCategories}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loaded Categories Grid */}
        {!isLoading && !hasError && catalogues.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pb-6">
            {catalogues.map((catalogue) => {
              const iconObj = catalogue.icon as ImageDocument | undefined;
              const imageUrl = iconObj?.url || "/icons/icon-192x192.png";
              const imageAlt = iconObj?.alt || catalogue.name || "Category";
              const targetHref = normalizePath(catalogue.path);

              return (
                <Link
                  key={String(catalogue._id)}
                  href={targetHref}
                  onClick={() => onClose?.()}
                  className="flex flex-col items-center gap-2 p-2 rounded-2xl border border-zinc-100/80 bg-zinc-50/50 hover:bg-[#b76e79]/5 hover:border-[#b76e79]/20 transition-all duration-200 cursor-pointer active:scale-95 group text-center"
                >
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-white shadow-xs p-1.5 border border-zinc-200/60 group-hover:border-[#b76e79]/30 transition-colors">
                    <NextImage
                      alt={imageAlt}
                      src={imageUrl}
                      width={120}
                      height={120}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/icons/icon-192x192.png";
                      }}
                      className="w-full h-full object-cover object-center rounded-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 group-hover:text-[#b76e79] transition-colors line-clamp-1 leading-snug">
                    {catalogue.name || "Category"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && catalogues.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Shapes className="w-10 h-10 mx-auto text-zinc-300 stroke-1" />
            <p className="text-sm font-medium text-zinc-600">No categories found</p>
            <p className="text-xs text-zinc-400">Please check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CatalogueDrawerContent);
