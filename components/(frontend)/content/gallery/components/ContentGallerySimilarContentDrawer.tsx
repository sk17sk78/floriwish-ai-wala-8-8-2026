"use client";

// icons
import { ArrowRight, Loader2, Sparkles, Star, X, Zap } from "lucide-react";
import { VegSymbol, NonVegSymbol } from "@/components/(_common)/Symbols/Edibles";

// utils
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getContentPrice } from "@/components/(frontend)/content/utils/getContentPrice";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { fetchContentPageSuggestions } from "@/request/content/contentPageSuggestions";

function ContentGallerySimilarContentDrawer({
  showDrawer,
  contents = [],
  categoryId,
  productSlug,
  categoryName = "Category",
  categoryUrl = "/",
  tags = [],
  isProduct = true,
  onChangeShowDrawer
}: {
  showDrawer: boolean;
  contents: ContentDocument[];
  categoryId?: string;
  productSlug?: string;
  categoryName?: string;
  categoryUrl?: string;
  tags?: string[];
  isProduct?: boolean;
  onChangeShowDrawer: (showDrawer: boolean) => void;
}) {
  const { location } = useAppStates();
  const selectedCity = location?.data?.selectedCity || null;
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [allContents, setAllContents] = useState<ContentDocument[]>(contents);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial contents
  useEffect(() => {
    if (contents && contents.length > 0) {
      setAllContents(contents);
    }
  }, [contents]);

  // Fallback initial fetch if contents is empty
  useEffect(() => {
    if (showDrawer && allContents.length === 0) {
      if (categoryId && categoryId.length === 24) {
        fetch(
          `/api/frontend/v2/frontend/content-category/more-products/${categoryId}?offset=0`
        )
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setAllContents(data);
            }
          })
          .catch(() => {});
      } else if (productSlug) {
        fetchContentPageSuggestions(productSlug)
          .then((res) => {
            if (res.data?._suggestions) {
              const list: ContentDocument[] = [
                ...((res.data._suggestions.aiTag || []) as ContentDocument[]),
                ...((res.data._suggestions.relatedAITag || []) as ContentDocument[]),
                ...((res.data._suggestions.category || []) as ContentDocument[])
              ];
              setAllContents(list);
            }
          })
          .catch(() => {});
      }
    }
  }, [showDrawer, allContents.length, categoryId, productSlug]);

  // Infinite Scroll Handler: loads more products when scrolling near bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || isLoadingMore || !hasMore || !categoryId || categoryId.length !== 24) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setIsLoadingMore(true);
      const currentOffset = allContents.length;
      fetch(
        `/api/frontend/v2/frontend/content-category/more-products/${categoryId}?offset=${currentOffset}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllContents((prev) => {
              const seen = new Set(prev.map((p) => String((p as any)._id || p.slug)));
              const uniqueNew = data.filter(
                (p) => !seen.has(String((p as any)._id || p.slug))
              );
              return [...prev, ...uniqueNew];
            });
            if (data.length < 10) {
              setHasMore(false);
            }
          } else {
            setHasMore(false);
          }
        })
        .catch(() => {
          setHasMore(false);
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [allContents.length, categoryId, hasMore, isLoadingMore]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSelectedTag(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDrawer) {
        onChangeShowDrawer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDrawer, onChangeShowDrawer]);

  // Filter contents based on selected tag
  const filteredContents = useMemo(() => {
    if (!selectedTag || selectedTag === "All" || !Array.isArray(allContents)) {
      return allContents;
    }
    const tagLower = selectedTag.toLowerCase().trim();

    if (tagLower === "best seller" || tagLower === "bestseller") {
      const best = allContents.filter(
        (item) =>
          item.isBestseller ||
          item.name?.toLowerCase().includes("bestseller") ||
          (item.tag?.promotionTag as any)?.name?.toLowerCase().includes("bestseller")
      );
      return best.length > 0 ? best : allContents.slice(0, 10);
    }

    if (tagLower === "popular") {
      const sorted = [...allContents].sort((a, b) => {
        const rA = Number(a.quality?.rating?.value || 4.5);
        const rB = Number(b.quality?.rating?.value || 4.5);
        return rB - rA;
      });
      return sorted;
    }

    const matched = allContents.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(tagLower);
      const slugMatch = item.slug?.toLowerCase().includes(tagLower);
      const aiTagMatch = item.tag?.aiTags?.some((t) =>
        typeof t === "string" ? t.toLowerCase().includes(tagLower) : false
      );
      const relatedTagMatch = item.tag?.relatedAITags?.some((t) =>
        typeof t === "string" ? t.toLowerCase().includes(tagLower) : false
      );
      return nameMatch || slugMatch || aiTagMatch || relatedTagMatch;
    });

    return matched.length > 0 ? matched : allContents;
  }, [allContents, selectedTag]);

  // Available tags to display in the filter pills row
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    if (categoryName && categoryName !== "Category") {
      set.add(categoryName);
    }
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        if (t && typeof t === "string" && t.trim().length > 0 && set.size < 6) {
          set.add(t.trim());
        }
      });
    }
    allContents.forEach((item) => {
      item.tag?.aiTags?.forEach((t) => {
        if (typeof t === "string" && t.trim().length > 0 && set.size < 6) {
          set.add(t.trim());
        }
      });
    });
    set.add("Best Seller");
    set.add("Popular");
    return ["All", ...Array.from(set)];
  }, [tags, allContents, categoryName]);

  if (!showDrawer || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      onClick={() => onChangeShowDrawer(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full h-[90vh] sm:h-[84vh] md:h-[82vh] xl:h-auto sm:w-[580px] md:w-[620px] lg:w-[660px] xl:w-[480px] max-w-[94vw] xl:max-w-[485px] sm:max-h-[820px] xl:max-h-[590px] bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-10 h-1 bg-zinc-200 rounded-full mx-auto mt-2.5 mb-0.5 shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 xl:px-5 pt-3 sm:pt-4 xl:pt-3.5 pb-2.5 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#fff0f5] text-[#ad2355] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ad2355]" />
            </div>
            <h2 className="text-sm sm:text-base xl:text-[15px] font-bold text-zinc-900 tracking-tight">
              {isProduct ? "Similar Products" : "Similar Packages"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onChangeShowDrawer(false)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Filter Pills Row in Floriwish Color Palette */}
        {availableTags.length > 0 && (
          <div className="px-4 sm:px-6 xl:px-5 py-2.5 xl:py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-zinc-50 shrink-0">
            {availableTags.map((tag, idx) => {
              const isSelected =
                (selectedTag === null && tag === "All") || selectedTag === tag;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTag(tag === "All" ? null : tag)}
                  className={`px-3.5 py-1 xl:py-0.5 rounded-full text-xs xl:text-[11.5px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#ad2355] text-white shadow-xs border border-[#ad2355] font-semibold"
                      : "bg-[#fff0f5] text-[#ad2355] border border-[#fcd5e2] hover:bg-[#ffe6ef]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable 2-Column Products Grid: Calibrated for Mobile, iPad & Laptop */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 xl:h-[395px] xl:flex-none overflow-y-auto overscroll-contain px-3.5 sm:px-6 xl:px-4 py-3 xl:py-2.5"
        >
          {filteredContents.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs sm:text-sm">
              No similar items found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:gap-3">
              {filteredContents.map((item, index) => {
                const { price, mrp } = getContentPrice({
                  price: item.price as any,
                  city: selectedCity
                });
                const itemType = item.type === "service" ? "service" : "product";
                const itemRating =
                  item.quality?.rating?.value || (4.7 + (index % 3) * 0.1).toFixed(1);
                const ratingCount = item.quality?.rating?.count || (120 + (index * 23));
                const primaryImage = item.media?.primary as ImageDocument | undefined;
                const isVegan = item.edible?.isEdible ? (item.edible as EdibleDocument).type || "veg" : undefined;
                const discountPct = mrp && price && mrp > price ? Math.ceil((1 - price / mrp) * 100) : 0;

                return (
                  <Link
                    key={item._id ? String(item._id) : index}
                    href={`/${itemType}/${item.slug}`}
                    onClick={() => onChangeShowDrawer(false)}
                    className="group flex flex-col bg-white rounded-xl sm:rounded-2xl border border-zinc-100 hover:border-[#ad2355]/30 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Card Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
                      <NextImage
                        src={primaryImage?.url || ""}
                        alt={primaryImage?.alt || primaryImage?.defaultAlt || item.name}
                        width={300}
                        height={300}
                        quality={75}
                        className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 46vw, (max-width: 1024px) 300px, 240px"
                      />

                      {/* Veg / Non-veg Symbol */}
                      {isVegan && (
                        <span className="absolute bottom-1.5 left-1.5">
                          {isVegan === "veg" ? (
                            <VegSymbol className="w-[15px] sm:w-[16px]" />
                          ) : (
                            <NonVegSymbol className="w-[15px] sm:w-[16px]" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Card Info matching Floriwish Design */}
                    <div className="flex flex-col gap-0.5 p-2 sm:p-3 xl:p-2">
                      {/* Delivery badge */}
                      <div className="flex items-center gap-0.5 w-fit bg-rose-50 border border-rose-100 rounded px-1.5 py-[1px]">
                        <Zap className="fill-[#ad2355] stroke-transparent shrink-0 w-2.5 h-2.5" />
                        <span className="text-[8.5px] sm:text-[9.5px] xl:text-[8.5px] font-bold tracking-tight uppercase text-[#ad2355] whitespace-nowrap">
                          Same Day
                        </span>
                      </div>

                      {/* Product Name */}
                      <p className="text-[12px] sm:text-[13px] xl:text-[12px] font-medium text-zinc-800 leading-snug line-clamp-2 mt-0.5 group-hover:text-[#ad2355] transition-colors">
                        {item.name}
                      </p>

                      {/* Price Row */}
                      <div className="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[13.5px] sm:text-[15px] xl:text-[13.5px] font-bold text-zinc-900">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {mrp > price && (
                          <del className="text-[10.5px] sm:text-[11.5px] xl:text-[10.5px] text-zinc-400 font-normal">
                            ₹{mrp.toLocaleString("en-IN")}
                          </del>
                        )}
                        {discountPct > 0 && (
                          <span className="text-[9.5px] xl:text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-[0.5px]">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>

                      {/* Rating Row */}
                      <div className="flex items-center gap-1 text-[11px] xl:text-[10.5px] text-zinc-500 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-zinc-700">{itemRating}</span>
                        <span className="text-[10.5px] xl:text-[10px] text-zinc-400">({ratingCount})</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {isLoadingMore && (
            <div className="py-3 flex items-center justify-center gap-1.5 text-[#ad2355] text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more items...</span>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Button in Floriwish Signature Brand Color */}
        <div className="p-3.5 sm:p-5 xl:p-3.5 border-t border-zinc-100 bg-white/95 backdrop-blur-md shrink-0">
          <Link
            href={categoryUrl || "/"}
            onClick={() => onChangeShowDrawer(false)}
            className="w-full py-3 sm:py-3.5 xl:py-2.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#ad2355] to-[#881840] hover:from-[#9c1f4c] hover:to-[#771537] text-white text-xs sm:text-sm md:text-base xl:text-sm font-semibold shadow-md shadow-[#ad2355]/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] cursor-pointer"
          >
            <span>View all in {categoryName || "Category"}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}

export default memo(ContentGallerySimilarContentDrawer);
