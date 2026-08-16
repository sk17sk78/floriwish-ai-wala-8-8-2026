"use client";

// libraries
import { getEarliestDeliveryDate, formatEarliestDelivery } from "@/common/utils/delivery";

// icons
import { Star as StarIcon, StarHalf, Zap } from "lucide-react";

// animation
import { ShineAnimation } from "../../../ShineAnimation/ShineAnimation";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { INRSymbol } from "@/common/constants/symbols";
import { NonVegSymbol, VegSymbol } from "@/components/(_common)/Symbols/Edibles";

// utils
import { alwaysDecimal } from "@/components/pages/(frontend)/Content/components/Details/helpers/alwaysDecimal";
import { getChromaticallyAbberatedShade } from "@/common/helpers/getChromaticallyABberatedShade";
import { getCityWiseContentPrices } from "@/common/helpers/getCityWiseContentPrices";

// hooks
import { useEffect, useId, useState } from "react";

// components
import OptimizedImage from "@/components/ui/optimized-image";
import Link from "next/link";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type ColorDocument } from "@/common/types/documentation/presets/color";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ContentQualityDocument } from "@/common/types/documentation/nestedDocuments/contentQuality";
import { type ContentsSortType } from "@/components/pages/(frontend)/CategoryList/static/types";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";
import { type PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";

export default function FrontendProductTilesUI({
  id,
  type,
  currSort,
  inAdmin,
  inCategoryPage,
  sync,
  extraCurved,
  limit,
  productList,
  selectedCity,
}: {
  id?: string;
  type?: "list" | "scrollable";
  currSort?: ContentsSortType;
  inAdmin?: boolean;
  inCategoryPage?: boolean;
  sync?: boolean;
  extraCurved?: boolean;
  limit?: number;
  productList: ContentDocument[];
  selectedCity: CityDocument | null;
}) {
  const [products, setProducts] = useState<ContentDocument[]>(productList || []);
  const [screenW, setScreenW] = useState<number>(300);

  const useIdId = useId();
  const trayId = id || useIdId;

  useEffect(() => {
    const updateWindowWidth = () => setScreenW(innerWidth);
    window.addEventListener("resize", updateWindowWidth);
    updateWindowWidth();
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    const tray = document.getElementById(trayId) as HTMLElement;
    tray.scrollTo({
      left: tray.scrollLeft + (dir === "left" ? -1 : 1) * (screenW * 0.65),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (sync || inAdmin) setProducts(productList);
  }, [sync, inAdmin, productList]);

  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const isScrollable = type === "scrollable";
  const isList = !type || type === "list";

  return (
    <div
      id={trayId}
      className={
        isList
          ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 items-start`
          : `relative flex items-start justify-start gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x touch-pan-x`
      }
      style={!isList ? { WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" } : undefined}
    >
      {products.slice(0, limit || products.length).map((content, index) => {
        const {
          media: { primary },
          name,
          slug,
          quality,
          edible,
          delivery,
          type: contentType,
        } = content;

        const { mrp: contentMrp, price: contentPrice } = inAdmin
          ? { mrp: 0, price: 0 }
          : getCityWiseContentPrices({ city: selectedCity, content });

        const discountPct =
          contentMrp && contentPrice && contentMrp > contentPrice
            ? Math.ceil((1 - contentPrice / contentMrp) * 100)
            : 0;

        const isVegan: "unspecified" | "veg" | "non-veg" | undefined =
          edible && (edible as EdibleDocument).isEdible
            ? (edible as EdibleDocument).type || "unspecified"
            : undefined;

        const processingTime = inAdmin
          ? 0
          : delivery
          ? ((delivery as ContentDeliveryDocument).processingTime as ProcessingTimeDocument)?.hours || 0
          : 0;

        const slots = (delivery as ContentDeliveryDocument)?.slots;
        const earliestDate = getEarliestDeliveryDate(processingTime, slots);
        const earliestDeliveryBy = formatEarliestDelivery(earliestDate);

        const sticker =
          content.tag?.promotionTag && !inAdmin
            ? {
                label: (content.tag.promotionTag as PromotionTagDocument).name,
                bgColor: ((content.tag.promotionTag as PromotionTagDocument).color as ColorDocument).hexCode,
                textColor: getChromaticallyAbberatedShade(
                  ((content.tag.promotionTag as PromotionTagDocument).color as ColorDocument).hexCode
                ),
              }
            : undefined;

        const ratingValue = (quality as ContentQualityDocument)?.rating?.value;
        const ratingCount = (quality as ContentQualityDocument)?.rating?.count;
        const isThisLoading = loadingSlug === slug;

        // Build stars
        const renderStars = (val: number) => {
          const full = Math.floor(val);
          const half = val % 1 >= 0.5;
          return (
            <span className="flex items-center gap-[1px]">
              {Array.from({ length: full }).map((_, i) => (
                <StarIcon key={i} width={11} height={11} className="fill-amber-400 stroke-transparent" />
              ))}
              {half && <StarHalf width={11} height={11} className="fill-amber-400 stroke-transparent" />}
            </span>
          );
        };

        return (
          <Link
            href={`${contentType === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${slug}`}
            key={index}
            onClick={() => setLoadingSlug(slug)}
            className={`group flex flex-col shrink-0 snap-start bg-white rounded-xl overflow-hidden border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all duration-300 ${
              isScrollable ? "min-w-[44vw] sm:min-w-[200px] max-w-[44vw] sm:max-w-[200px]" : "w-full"
            } ${isThisLoading ? "opacity-60 pointer-events-none" : ""}`}
            style={{ WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}
          >
            {/* ── IMAGE ── */}
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
              <OptimizedImage
                src={(primary as ImageDocument)?.url || ""}
                alt={
                  (primary as ImageDocument)?.alt ||
                  (primary as ImageDocument)?.defaultAlt ||
                  name
                }
                fill
                quality={70}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="absolute inset-0"
                imageClassName="object-cover object-center scale-100"
              />

              {/* Veg/Non-veg symbol */}
              {isVegan && isVegan !== "unspecified" && (
                <span className="absolute bottom-1.5 left-1.5">
                  {isVegan === "veg" ? (
                    <VegSymbol className="w-[18px]" />
                  ) : (
                    <NonVegSymbol className="w-[18px]" />
                  )}
                </span>
              )}

              {/* Promotion sticker */}
              {sticker && (
                <div
                  className="absolute top-2 left-0 py-1 px-2 sm:px-3 rounded-r-lg text-[11px] sm:text-sm"
                  style={{ background: sticker.bgColor, color: sticker.textColor }}
                >
                  {sticker.label}
                </div>
              )}

              {/* Discount badge — top right — removed, shown in price row */}

              {(isScrollable || inCategoryPage) && <ShineAnimation />}
            </div>

            {/* ── INFO ── */}
            <div className="flex flex-col gap-1 px-2 sm:px-3 pt-2 pb-2.5">

              {/* Delivery badge */}
              {!inAdmin && earliestDeliveryBy && (
                <div className="flex items-center gap-1 w-fit bg-rose-50 border border-rose-100 rounded-md px-2 py-[3px]">
                  <Zap className="fill-rose-900 stroke-transparent shrink-0" width={9} height={9} />
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wide uppercase text-rose-900 whitespace-nowrap">
                    {earliestDeliveryBy}{" "}
                    {earliestDeliveryBy === "Today" || earliestDeliveryBy === "Tomorrow" ? "Delivery" : ""}
                  </span>
                </div>
              )}

              {/* Product name — 1 line truncated */}
              <p className="text-[13px] sm:text-[14px] font-medium text-zinc-800 leading-snug truncate">
                {name}
              </p>

              {/* Price row */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {contentPrice ? (
                  <span className="text-[14px] sm:text-[15px] font-bold text-zinc-900">
                    {inAdmin ? "Price" : `${INRSymbol}${contentPrice}`}
                  </span>
                ) : null}
                {contentMrp && contentPrice && contentMrp > contentPrice && (
                  <del className="text-[11px] sm:text-[12px] text-zinc-400 font-normal">
                    {INRSymbol}{contentMrp}
                  </del>
                )}
                {discountPct > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-[2px] whitespace-nowrap">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Rating row */}
              {ratingValue ? (
                <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-zinc-500">
                  {renderStars(Number(ratingValue))}
                  <span className="font-medium text-zinc-600">
                    {alwaysDecimal(Number(ratingValue))}
                  </span>
                  {ratingCount ? (
                    <span className="text-zinc-400">({ratingCount} reviews)</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
