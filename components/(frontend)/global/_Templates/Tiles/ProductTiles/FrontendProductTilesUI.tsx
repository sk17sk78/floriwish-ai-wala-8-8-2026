"use client";

// libraries
import moment from "moment";
import { getEarliestDeliveryDate, formatEarliestDelivery } from "@/common/utils/delivery";

// icons
import { ChevronLeftIcon, ChevronRightIcon, Star as StarIcon, StarHalf, Zap } from "lucide-react";

// animation
import { ShineAnimation } from "../../../ShineAnimation/ShineAnimation";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { INRSymbol } from "@/common/constants/symbols";
import {
  NonVegSymbol,
  VegSymbol,
} from "@/components/(_common)/Symbols/Edibles";

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
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
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
  const [products, setProducts] = useState<ContentDocument[]>(
    productList || [],
  );
  const [screenW, setScreenW] = useState<number>(300);

  const useIdId = useId();
  const trayId = id || useIdId;

  useEffect(() => {
    const updateWindowWidth = () => {
      setScreenW((prev) => innerWidth);
    };
    window.addEventListener("resize", updateWindowWidth);
    updateWindowWidth();
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    const tray = document.getElementById(trayId) as HTMLElement;

    const currOffset = tray.scrollLeft;

    tray.scrollTo({
      left: currOffset + (dir === "left" ? -1 : 1) * (screenW * 0.65),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (sync || inAdmin) {
      setProducts((prev) => productList);
    }
  }, [sync, inAdmin, productList]);

  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  return (
    <div
      id={trayId}
      className={`${!type || type === "list" ? `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 ${inCategoryPage ? "sm:gap-y-6 sm:gap-x-3" : "sm:gap-6"} items-start justify-center` : "relative flex items-center justify-start gap-2 sm:gap-5 overflow-x-scroll scrollbar-hide "}`}
    >
      {/* Buttons removed for native scrolling experience */}

      {products.slice(0, limit || products.length).map((content, index) => {
        const {
          _id,
          media: { primary },
          name,
          price,
          slug,
          quality,
          edible,
          delivery,
          type: contentType,
        } = content;

        const { mrp: contentMrp, price: contentPrice } = inAdmin
          ? { mrp: 0, price: 0 }
          : getCityWiseContentPrices({ city: selectedCity, content });

        const showVeganType = edible
          ? (edible as EdibleDocument).isEdible
          : false;

        const isVegan: "unspecified" | "veg" | "non-veg" | undefined =
          edible && (edible as EdibleDocument).isEdible
            ? (edible as EdibleDocument).type || "unspecified"
            : undefined;

        // delivery logic
        const processingTime = inAdmin
          ? 0
          : (delivery
            ? (
              (delivery as ContentDeliveryDocument)
                .processingTime as ProcessingTimeDocument
            ).hours || 0
            : 0);

        const slots = (delivery as ContentDeliveryDocument)?.slots;
        const earliestDate = getEarliestDeliveryDate(processingTime, slots);
        const earliestDeliveryBy = formatEarliestDelivery(earliestDate);

        const sticker =
          content.tag && content.tag.promotionTag && inAdmin !== true
            ? {
                label: (content.tag.promotionTag as PromotionTagDocument).name,
                bgColor: (
                  (content.tag.promotionTag as PromotionTagDocument)
                    .color as ColorDocument
                ).hexCode,
                textColor: getChromaticallyAbberatedShade(
                  (
                    (content.tag.promotionTag as PromotionTagDocument)
                      .color as ColorDocument
                  ).hexCode,
                ),
              }
            : undefined;

        const isThisLoading = loadingSlug === slug;

        return (
          <Link
            href={`${contentType === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${slug}`}
            key={index}
            onClick={() => setLoadingSlug(slug)}
            className={`group grid *:row-start-1 *:col-start-1 shrink-0 ${!type || type === "list" ? `min-w-[40dvw] sm:min-w-0` : "min-w-[38dvw] max-w-[38dvw] sm:min-w-[18dvw] sm:max-w-[18dvw]"} rounded-none h-fit min-h-fit transition-all duration-300 ${isThisLoading ? "opacity-70 pointer-events-none grayscale-[0.3]" : ""}`}
          >
            <div
              className={`relative z-20 transition-all duration-300 rounded-none sm:rounded-xl bg-transparent ${!type || type === "list" ? `${index > 1 ? "max-sm:border-t-[0.5px]" : ""} max-sm:pt-2.5 max-sm:pb-1 ${index % 2 === 0 ? "max-sm:pl-2.5 max-sm:pr-[6px]" : "max-sm:pl-[6px] max-sm:pr-2.5"}` : "max-sm:pt-2.5 max-sm:pb-1 max-sm:px-2.5"} border-ash/25`}
            >
              <div
                className={`relative aspect-square max-sm:p-1 rounded-t-xl sm:rounded-t-2xl overflow-hidden `}
              >
                <OptimizedImage
                  src={(primary as ImageDocument)?.url || ""}
                  alt={
                    (primary as ImageDocument)?.alt ||
                    (primary as ImageDocument)?.defaultAlt ||
                    "Content Image"
                  }
                  fill
                  quality={75}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="absolute inset-0"
                  imageClassName={`${extraCurved ? "max-sm:rounded-xl" : "max-sm:rounded-md"} object-cover object-center scale-105 group-hover:scale-100 transition-all duration-500`}
                />
                <span className="absolute bottom-1 left-1 sm:left-1">
                  {showVeganType ? (
                    isVegan === "veg" ? (
                      <VegSymbol className="w-[20px] sm:w-[19px] sm:max-w-[19px] sm:translate-x-1" />
                    ) : isVegan === "non-veg" ? (
                      <NonVegSymbol className="w-[20px] sm:w-[19px] sm:max-w-[19px] sm:translate-x-1" />
                    ) : (
                      <></>
                    )
                  ) : (
                    <></>
                  )}
                </span>

                {sticker && (
                  <div
                    className="absolute top-2 left-0 py-1 px-2 sm:px-3 rounded-r-lg text-[11px] sm:text-sm"
                    style={{
                      background: sticker.bgColor,
                      color: sticker.textColor,
                    }}
                  >
                    {sticker.label}
                  </div>
                )}

                {/* {(quality as ContentQualityDocument)?.rating?.count && (
                      <div
                        className={`absolute bottom-1 right-1 flex items-center justify-end gap-1 text-xs sm:text-sm py-0.5 px-1.5 rounded-sm backdrop-blur-sm backdrop-brightness-105 ${(quality as ContentQualityDocument)?.rating?.count === 5 ? "" : "bg-ivory-1/35 text-charcoal-3/90"}`}
                      >
                        {(quality as ContentQualityDocument)?.rating?.value || 5}{" "}
                        <StarIcon
                          width={16}
                          height={16}
                          className="fill-sienna-1 stroke-transparent brightness-105"
                        />
                        | {(quality as ContentQualityDocument)?.rating?.count}
                      </div>
                    )} */}

                {type === "scrollable" || inCategoryPage ? (
                  <ShineAnimation />
                ) : (
                  <></>
                )}
              </div>

              <div
                className={`relative pt-2 flex flex-col gap-y-0.5 rounded-b-xl sm:rounded-b-2xl overflow-hidden bg-transparent mt-0 sm:border-[1.5px] sm:border-ash/40 border-t-0`}
              >
                {!inAdmin &&
                earliestDeliveryBy &&
                earliestDeliveryBy.length > 0 ? (
                  <div className="px-1 sm:px-3 pt-1 pb-1">
                    <div className="flex items-center justify-center gap-x-1 bg-sienna-3/20 w-fit px-2 py-[2px] rounded text-sienna-1">
                      <Zap
                        className="fill-sienna-1 stroke-transparent"
                        width={11}
                        height={11}
                      />
                      <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap">
                        {earliestDeliveryBy}{" "}
                        {earliestDeliveryBy === "Today" ||
                        earliestDeliveryBy === "Tomorrow"
                          ? "Delivery"
                          : ""}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div
                  className={`${showVeganType ? "pr-0 grid grid-cols-[1fr_20px] items-center" : "grid grid-cols-1 items-center"} px-1 max-sm:pt-1 sm:px-3 z-30 text-[15px] sm:text-base text-charcoal-3/80 leading-tight relative `}
                >
                  <div
                    className={` ${type === "scrollable" ? "line-clamp-1" : "line-clamp-2 pt-0.5 max-sm:pb-0.5"} leading-tight text-left w-full`}
                  >
                    {name}
                  </div>

                  {/* <span className="justify-self-end">
                        {showVeganType ? (
                          isVegan === "veg" ? (
                            <VegSymbol className="w-[20px] sm:w-[19px] sm:max-w-[19px] sm:translate-x-1" />
                          ) : isVegan === "non-veg" ? (
                            <NonVegSymbol className="w-[20px] sm:w-[19px] sm:max-w-[19px] sm:translate-x-1" />
                          ) : (
                            <></>
                          )
                        ) : (
                          <></>
                        )}
                      </span> */}
                </div>
                <div
                  className={`px-1 sm:px-3 ${false ? "" : contentType !== "service" && earliestDeliveryBy && earliestDeliveryBy.length > 0 ? "" : " "} relative flex items-baseline justify-start gap-2 w-full z-20`}
                >
                  {contentPrice && (
                    <h4 className="text-[14px] sm:text-[18px] text-charcoal-3 group-hover:text-sienna-1 font-semibold transition-all duration-300">
                      {inAdmin ? "" : INRSymbol}{" "}
                      {inAdmin ? "Price" : contentPrice}
                    </h4>
                  )}
                  {/* {(price as ContentPriceDocument).base.mrp && (
                        <del className="text-[12.5px] sm:text-[15px] text-charcoal-3/50 transition-all duration-300">
                          &nbsp;{INRSymbol}{" "}
                          {(price as ContentPriceDocument).base.mrp}&nbsp;
                        </del>
                      )} */}
                  {(quality as ContentQualityDocument)?.rating &&
                  (quality as ContentQualityDocument)?.rating?.value ? (
                    <div className="flex items-center justify-start gap-0.5 text-xs sm:text-sm text-charcoal-3/80 sm:ml-1.5 translate-y-1 sm:translate-y-0.5">
                      <div className="flex items-center">
                        {(() => {
                          const ratingNum = Number((quality as ContentQualityDocument)?.rating?.value || 5);
                          const fullStars = Math.floor(ratingNum);
                          const hasHalfStar = ratingNum % 1 >= 0.5;
                          const stars = [];

                          for (let i = 0; i < fullStars; i++) {
                            stars.push(
                              <StarIcon
                                key={`full-${i}`}
                                width={11}
                                height={11}
                                className="fill-sienna-1 stroke-transparent brightness-105"
                              />
                            );
                          }

                          if (hasHalfStar) {
                            stars.push(
                              <StarHalf
                                key="half"
                                width={11}
                                height={11}
                                className="fill-sienna-1 stroke-transparent brightness-105"
                              />
                            );
                          }

                          return stars;
                        })()}
                      </div>
                      {alwaysDecimal(
                        (quality as ContentQualityDocument)?.rating?.value || 5,
                      )}{" "}
                    </div>
                  ) : (
                    <></>
                  )}

                  {contentMrp &&
                  contentPrice &&
                  Math.ceil((1 - contentPrice / contentMrp) * 100) > 0 ? (
                    <div className="text-[10.5px] ml-1 leading-none bg-emerald-700 text-white py-0.5 px-2 rounded-full font-medium">
                      {Math.ceil((1 - contentPrice / contentMrp) * 100)}% off
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                {/* {(quality as ContentQualityDocument)?.rating?.count && (
                      <div
                        className={`sm:absolute ${earliestDeliveryBy && earliestDeliveryBy.length > 0 ? "sm:bottom-9" : "sm:bottom-3"} sm:right-2 max-sm:pb-1.5 max-sm:pt-1 flex items-center justify-start sm:justify-end gap-1 text-xs sm:text-sm py-0.5 pl-1 sm:px-0 rounded-full backdrop-brightness-105 ${(quality as ContentQualityDocument)?.rating?.count === 5 ? "" : "bg-transparent text-charcoal-3/90"}`}
                      >
                        {(quality as ContentQualityDocument)?.rating?.value || 5}{" "}
                        <StarIcon
                          width={16}
                          height={16}
                          className="fill-sienna-1 stroke-transparent brightness-105 scale-95"
                        />
                        | {(quality as ContentQualityDocument)?.rating?.count}
                      </div>
                    )} */}

                {/* {contentType === "service" && !inAdmin ? (
                    <div
                      className={`px-1 sm:px-3 pb-1.5 sm:pb-2.5 pt-0.5 relative flex items-center justify-start gap-1.5 text-sm text-green-800 z-20`}
                    >
                      You save {INRSymbol}
                      {contentMrp - contentPrice}
                    </div>
                  ) : (
                    <></>
                  )} */}
              </div>
            </div>

            {/* background effect ---------------------------------------------------------------- */}
            <div
              className={
                type === "scrollable"
                  ? "z-30 relative bg-transparent rounded-md sm:rounded-xl border border-transparent group-hover:border-charcoal-3/10 transition-all duration-300"
                  : "max-sm:hidden z-30 relative bg-transparent rounded-md sm:rounded-xl border border-transparent group-hover:border-charcoal-3/10 transition-all duration-300"
              }
            />
            {!inCategoryPage && (!type || type === "list") ? (
              <div className="z-10 relative bg-transparent rounded-2xl sm:rounded-3xl">
                <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 scale-0 group-hover:scale-[1.15] bg-transparent border-[1.4px] sm:border-[1.9px] border-sienna-1 aspect-square w-7 sm:w-14 h-7 sm:h-14 transition-all duration-500" />
                <div className="absolute -bottom-0.5 sm:-bottom-1 -left-0.5 sm:-left-1 scale-0 group-hover:scale-[1.15] bg-transparent border-[1.4px] sm:border-[1.9px] border-sienna-1 aspect-square w-7 sm:w-14 h-7 sm:h-14 transition-all duration-500" />
              </div>
            ) : (
              <></>
            )}
          </Link>
        );
      })}

      {/* Buttons removed for native scrolling experience */}
    </div>
  );
}
