"use client";

// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// libraries

// icons
import { ChevronLeftIcon, ChevronRightIcon, Star, StarHalf, Zap } from "lucide-react";
import {
  getEarliestDeliveryDate,
  formatEarliestDelivery,
} from "@/common/utils/delivery";

// animation
import { ShineAnimation } from "../../../ShineAnimation/ShineAnimation";

// constants
import { INRSymbol } from "@/common/constants/symbols";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import {
  NonVegSymbol,
  VegSymbol,
} from "@/components/(_common)/Symbols/Edibles";

// utils
import { getChromaticallyAbberatedShade } from "@/common/helpers/getChromaticallyABberatedShade";
import { getCityWiseContentPrices } from "@/common/helpers/getCityWiseContentPrices";

// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useEffect, useId, useState } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ContentQualityDocument } from "@/common/types/documentation/nestedDocuments/contentQuality";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { type ColorDocument } from "@/common/types/documentation/presets/color";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";
import { type PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";
import { normalizeRating } from "@/common/helpers/normalizeRating";
import { getRatingValue } from "@/components/(frontend)/content/utils/getRatingValue";
import { type ContentsSortType } from "@/components/pages/(frontend)/CategoryList/static/types";

export default function FrontendProductTilesUI({
  id,
  type,
  currSort,
  inAdmin,
  inCategoryPage,
  inHomePage,
  sync,
  extraCurved,
  limit,
  productList,
}: {
  id?: string;
  type?: "list" | "scrollable";
  currSort?: ContentsSortType;
  inAdmin?: boolean;
  inCategoryPage?: boolean;
  inHomePage?: boolean;
  sync?: boolean;
  extraCurved?: boolean;
  limit?: number;
  productList: ContentDocument[];
}) {
  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  const [products, setProducts] = useState<ContentDocument[]>(
    productList || [],
  );
  const [screenW, setScreenW] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  const useIdId = useId();
  const trayId = id || useIdId;

  useEffect(() => {
    setIsMounted(true);
    const updateWindowWidth = () => {
      setScreenW(window.innerWidth);
    };
    updateWindowWidth();
    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    const tray = document.getElementById(trayId) as HTMLElement;
    if (!tray) return;

    const currOffset = tray.scrollLeft;
    const scrollAmount = screenW > 0 ? screenW * 0.65 : 300;

    tray.scrollTo({
      left: currOffset + (dir === "left" ? -1 : 1) * scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (sync || inAdmin) {
      setProducts((prev) => productList);
    }
  }, [sync, inAdmin, productList]);

  return (
    <div
      id={trayId}
      className={`${!type || type === "list" ? `grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-6 md:grid-cols-4 md:gap-x-5 md:px-2 lg:gap-x-10 lg:px-10 ${inCategoryPage || inHomePage ? "" : ""}` : "relative flex flex-nowrap items-center justify-start gap-4 sm:gap-6 md:gap-6 lg:gap-5 overflow-x-auto scrollbar-hide "}`}
    >
      {/* Buttons removed for native scrolling experience */}

      {products.slice(0, limit || products.length).map((content, index) => {
        const {
          _id,
          media,
          name,
          price,
          slug,
          quality,
          edible,
          delivery,
          type: contentType,
        } = content;

        const primary = media?.primary;

        const { mrp: contentMrp, price: contentPrice } = inAdmin
          ? getCityWiseContentPrices({ city: null, content })
          : inCategoryPage
            ? {
                mrp: content?.price?.base?.mrp || 0,
                price: content?.price?.base?.price || 0,
              }
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
          : delivery
            ? (
                (delivery as ContentDeliveryDocument)
                  .processingTime as ProcessingTimeDocument
              ).hours || 0
            : 0;

        const slots = (delivery as ContentDeliveryDocument)?.slots;
        const earliestDate = getEarliestDeliveryDate(processingTime, slots);
        const earliestDeliveryBy = formatEarliestDelivery(earliestDate, {
          showDelivery: true,
        });

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

        return (
          <Link
            href={`${contentType === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${slug}`}
            key={index}
            className={`group grid *:row-start-1 *:col-start-1 shrink-0 ${!type || type === "list" ? `min-w-[40dvw] sm:min-w-0` : "min-w-[38dvw] max-w-[38dvw] sm:min-w-[18dvw] sm:max-w-[18dvw]"} rounded-none h-fit min-h-fit`}
          >
            <div
              className={`relative z-20 transition-all duration-300 rounded-none sm:rounded-xl sm:bg-ivory-1 bg-transparent ${!type || type === "list" ? `${index > 1 ? "max-sm:border-t-[0.5px]" : ""} max-sm:pt-2.5 max-sm:pb-1 ${index % 2 === 0 ? "max-sm:pl-2.5 max-sm:pr-[6px]" : "max-sm:pl-[6px] max-sm:pr-2.5"}` : "max-sm:pt-2.5 max-sm:pb-1 max-sm:px-2.5"} border-ash/25`}
            >
              <div
                className={`relative aspect-square max-sm:p-1 rounded-t-xl sm:rounded-t-2xl overflow-hidden `}
              >
                <NextImage
                  src={(primary as ImageDocument)?.url || ""}
                  alt={
                    (primary as ImageDocument)?.alt ||
                    name ||
                    (primary as ImageDocument)?.defaultAlt ||
                    "Content Image"
                  }
                  height={500}
                  width={500}
                  quality={25}
                  className={`${extraCurved ? "max-sm:rounded-xl" : "max-sm:rounded-md"} w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-all duration-500`}
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
                  )
                }
                </span>

                {sticker && (
                  <div
                    className="absolute top-2 right-0 py-1 px-2 sm:px-3 rounded-l-lg text-xs sm:text-sm"
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

                {type === "scrollable" || inCategoryPage || inHomePage ? (
                  <ShineAnimation />
                ) : (
                  <></>
                )}
              </div>

              <div
                className={`relative pt-2 flex flex-col gap-y-0.5 rounded-b-xl sm:rounded-b-2xl overflow-hidden sm:bg-ivory-1 bg-transparent mt-0 sm:border-[1.5px] sm:border-ash/40 border-t-0`}
              >
                {!inAdmin &&
                earliestDeliveryBy &&
                earliestDeliveryBy.length > 0 ? (
                  <div className="px-1 sm:px-3 md:px-1.5 pt-1 pb-1">
                    <div className="flex items-center justify-center gap-x-1 bg-sienna-3/20 w-fit px-2 py-[2px] rounded text-[#9E2A2B]">
                      <Zap
                        className="fill-[#9E2A2B] stroke-transparent"
                        width={11}
                        height={11}
                      />
                      <span className="text-[10px] sm:text-[11px] md:text-[9.5px] font-bold tracking-wide uppercase whitespace-nowrap">
                        {earliestDeliveryBy}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div
                  className={`${showVeganType ? "pr-0 grid grid-cols-[1fr_20px] items-center" : "grid grid-cols-1 items-center"} px-1 max-sm:pt-1 sm:px-3 md:px-1.5 z-30 text-[15px] sm:text-base md:text-[13px] text-charcoal-3/80 leading-tight relative `}
                >
                  <div
                    className={` ${type === "scrollable" ? "line-clamp-1" : "line-clamp-1 pt-0.5 pb-0.5"} leading-tight text-left w-full`}
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
                  className={`px-1 sm:px-3 md:px-1.5 ${false ? "" : contentType !== "service" && earliestDeliveryBy && earliestDeliveryBy.length > 0 ? "" : " "} relative flex items-baseline justify-start gap-2 w-full z-20`}
                >
                  {(contentPrice || inAdmin) && (
                    <div className="text-[14px] sm:text-[18px] md:text-[14px] text-charcoal-3 group-hover:text-sienna-1 flex items-center justify-start gap-3 font-semibold transition-all duration-300">
                      {INRSymbol}{" "}
                      {contentPrice || (inAdmin ? "Price" : 0)}
                      {inAdmin ? (
                        ""
                      ) : contentPrice &&
                        contentMrp &&
                        Math.ceil((1 - contentPrice / contentMrp) * 100) > 0 ? (
                        <div className="text-sm font-medium text-green-700">
                          {`${Math.ceil((1 - contentPrice / contentMrp) * 100)}% off`}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                  {/* {contentMrp > 0 && (
                    <del className="text-[12.5px] sm:text-[15px] text-charcoal-3/50 transition-all duration-300">
                      &nbsp;{INRSymbol} {contentMrp}&nbsp;
                    </del>
                  )} */}
                  {/* {(quality as ContentQualityDocument)?.rating &&
                    (quality as ContentQualityDocument)?.rating?.value ? (
                    <div className="flex items-center justify-start gap-1 text-xs sm:text-sm text-charcoal-3/80 sm:ml-1.5 translate-y-1 sm:translate-y-0.5">
                      <StarIcon
                        width={16}
                        height={16}
                        className="fill-sienna-1 stroke-transparent brightness-105 max-sm:scale-90"
                      />
                      {alwaysDecimal(
                        (quality as ContentQualityDocument)?.rating?.value || 5
                      )}{" "}
                    </div>
                  ) : (
                    <></>
                  )} */}

                  {/* {contentMrp &&
                  contentPrice &&
                  Math.ceil((1 - contentPrice / contentMrp) * 100) > 0 ? (
                    <div className="text-[10.5px] ml-1 leading-none bg-emerald-700 text-white py-0.5 px-2 rounded-full font-medium">
                      {Math.ceil((1 - contentPrice / contentMrp) * 100)}% off
                    </div>
                  ) : (
                    <></>
                  )} */}
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

                <div className="flex text-charcoal-3/70 px-1 text-[10px] sm:text-sm md:text-[11px] font-medium sm:px-3.5 md:px-1.5 pb-3 items-center justify-start gap-x-0.5 sm:gap-x-1 whitespace-nowrap overflow-hidden">
                  <div className="flex items-center gap-[1px]">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingValue = normalizeRating((quality as ContentQualityDocument)?.rating?.value || 5) || 5;
                      if (i + 1 <= Math.floor(ratingValue)) {
                        return (
                          <Star
                            key={i}
                            className="fill-amber-500 text-amber-500 w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] md:w-[11px] md:h-[11px]"
                          />
                        );
                      } else if (i + 0.5 <= ratingValue) {
                        return (
                          <StarHalf
                            key={i}
                            className="fill-amber-500 text-amber-500 w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] md:w-[11px] md:h-[11px]"
                          />
                        );
                      } else {
                        return (
                          <Star
                            key={i}
                            className="text-amber-500 w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] md:w-[11px] md:h-[11px]"
                          />
                        );
                      }
                    })}
                  </div>
                  <span className="shrink-0">
                    {getRatingValue(
                      (quality as ContentQualityDocument)?.rating?.value || 5,
                    )}
                  </span>
                  <span className="whitespace-nowrap">
                    ({(quality as ContentQualityDocument)?.rating?.count || 0}{" "}
                    reviews)
                  </span>
                </div>

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
            {!inCategoryPage && !inHomePage && (!type || type === "list") ? (
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
