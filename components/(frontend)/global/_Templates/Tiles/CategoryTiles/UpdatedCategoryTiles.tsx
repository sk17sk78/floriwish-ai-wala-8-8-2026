"use client";
import { ClassNameType } from "@/common/types/reactTypes";
import { BasicImageType } from "@/common/types/types";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import Link from "next/link";
import { useEffect, useId, useState, useRef } from "react";
import ShineAnimation from "../../ShineAnimation/ShineAnimation";

type LocalCategoryDocument = {
  _id: string;
  label: string;
  link: string;
  image: BasicImageType;
};

export default function Categories({
  categoryList,
  columns,
  shape,
  className,
  scrollable,
  asPreview,
  asCategoryPageQuickLink,
  asCard,
  mobileItemsPerView,
  isTopCategory,
}: {
  categoryList: LocalCategoryDocument[];
  columns: number;
  shape: "circle" | "square";
  className?: ClassNameType;
  scrollable?: boolean;
  asPreview?: boolean;
  asCategoryPageQuickLink?: boolean;
  asCard?: boolean;
  mobileItemsPerView?: number;
  isTopCategory?: boolean;
}) {
  const trayRef = useRef<HTMLDivElement>(null);

  const hasNoImages: boolean = categoryList.every(
    ({ image }) => !image || !image.url || image.url.length === 0,
  );

  const handleScroll = (dir: "left" | "right") => {
    if (!trayRef.current) return;

    const width = typeof window !== "undefined" ? window.innerWidth : 0;
    const scrollAmount = width > 0 ? width * 0.65 : 300;

    trayRef.current.scrollBy({
      left: (dir === "left" ? -1 : 1) * scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Initial peek scroll for mobile circle categories (Balloon Decor)
    if (
      scrollable &&
      trayRef.current &&
      mobileItemsPerView === 3 &&
      typeof window !== "undefined" &&
      window.innerWidth < 640
    ) {
      const timer = setTimeout(() => {
        if (trayRef.current) {
          trayRef.current.scrollLeft = 45;
        }
      }, 500); // Small delay to ensure content is rendered
      return () => clearTimeout(timer);
    }
  }, [scrollable, mobileItemsPerView]);

  return (
    <div
      ref={trayRef}
      className={`${
        isTopCategory && !scrollable // HIGHEST PRIORITY: If Top Category AND not scrollable, strictly force Grid layout on Mobile
          ? `grid responsive-grid gap-x-3 gap-y-4 px-4 py-4 lg:grid lg:justify-center lg:justify-items-center lg:px-0 lg:py-0`
          : scrollable
            ? `relative flex ${
                asCategoryPageQuickLink ? "items-start" : "items-center"
              } flex-nowrap justify-start overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-0`
            : hasNoImages
              ? `flex items-center justify-start gap-x-2 *:max-sm:px-2 *:px-4 *:py-1.5 *:rounded-xl *:transition-all *:duration-300`
              : `${!scrollable ? "grid responsive-grid gap-x-4 gap-y-6 px-4" : "flex flex-nowrap overflow-x-auto " + (shape === "circle" ? "pl-4" : "px-4")} py-4 scrollbar-hide lg:grid lg:justify-center lg:justify-items-center lg:px-0 lg:py-0`
      } ${
        isTopCategory // Top category styling is handled above, skip adding overlapping flex gaps
          ? ""
          : shape === "circle"
            ? `gap-x-6 gap-y-6 sm:gap-x-12 lg:gap-x-16 sm:gap-y-8 ${
                asCategoryPageQuickLink ? "max-sm:px-4" : ""
              } ${scrollable ? "" : "sm:px-3"} sm:py-3`
            : `gap-x-4 gap-y-2.5 ${
                scrollable
                  ? asCard
                    ? "sm:gap-x-4 px-1"
                    : "sm:gap-x-7"
                  : "sm:gap-x-4"
              }`
      } ${asCategoryPageQuickLink ? "pl-3" : ""} w-full transition-all duration-300 scrollbar-hide ${className || ""}`}
      style={
        !scrollable
          ? ({
              "--cols-mobile": columns === 8 ? 4 : 3,
              "--cols-tablet": columns || 6,
              "--cols-desktop": columns || 6,
            } as React.CSSProperties)
          : {}
      }
    >
      {/* left button ------------------------- */}
      {scrollable || asCategoryPageQuickLink ? (
        <>
          {categoryList.length >
            (asCategoryPageQuickLink && shape === "circle" ? 4 : 6) && (
            <div
              className="max-sm:hidden max-w-10 w-9 h-9 sm:w-10 sm:h-10 sticky top-[40%] sm:top-1/2 aspect-square -translate-y-1/2 -left-1 sm:left-0 rounded-full cursor-pointer flex items-center justify-center bg-white/70 p-1.5 sm:p-2 backdrop-blur-md border border-neutral-200 text-slate-900 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 max-sm:mr-[-35px] mr-[-44px] z-50 shadow-lg"
              onClick={() => handleScroll("left")}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
          )}
        </>
      ) : (
        <></>
      )}

      {categoryList.map(({ _id, label, link, image }, index) => {
        const alt = image?.alt;
        const url = image?.url;
        const content = (
          <>
            {hasNoImages !== true && (
              <div
                className={`relative ${isTopCategory && shape !== "circle" ? "" : "overflow-hidden"} bg-transparent w-full ${
                  asCategoryPageQuickLink
                    ? "rounded-lg aspect-[4/3] sm:aspect-video"
                    : shape === "circle"
                      ? "rounded-full aspect-square"
                      : "rounded-xl aspect-square"
                } ${
                  shape === "circle" && !asCategoryPageQuickLink
                    ? `ring-1 sm:ring-4 ring-offset-[3px] sm:ring-offset-4 ${isTopCategory ? "ring-[#fce7f3]" : "ring-sienna/70"}`
                    : ""
                }  grid place-items-center overflow-hidden relative`}
              >
                <OptimizedImage
                  src={
                    url ||
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
                  }
                  alt={alt || "Category Image"}
                  fill
                  quality={50}
                  draggable={false}
                  priority={index < (columns || 6)}
                  sizes="(max-width: 640px) 25vw, 150px"
                  className="absolute inset-0"
                  imageClassName={`object-cover object-center ${isTopCategory ? "scale-100" : "scale-105"} sm:scale-100 group-hover:scale-100 sm:group-hover:scale-95 transition-all duration-300 ${
                    shape === "circle" || isTopCategory
                      ? ""
                      : "border border-transparent rounded-xl"
                  }`}
                />
                <ShineAnimation />
              </div>
            )}
            {label && label.length > 0 ? (
              <h2
                className={`flex items-start justify-center text-center leading-[1.15] sm:text-lg md:text-sm md:font-semibold w-full max-w-full text-zinc-800 font-poppins font-medium ${
                  shape === "circle" && !asCategoryPageQuickLink
                    ? "max-sm:text-[13px] text-[13.5px]"
                    : "text-[13.5px]"
                } ${
                  asCategoryPageQuickLink ? "flex-wrap gap-x-1" : "line-clamp-2"
                } transition-all duration-300`}
              >
                {asCategoryPageQuickLink && !hasNoImages
                  ? label
                      .split(" ")
                      .map((str, idx) => <span key={idx}>{str}</span>)
                  : label}
              </h2>
            ) : (
              <></>
            )}
          </>
        );

        // Force grid elements to respect pure 'w-full' so Grid system governs proportions
        const itemClassName = `group flex items-center justify-start flex-col 
            ${
              isTopCategory && !scrollable
                ? "gap-1.5 sm:gap-2 w-full"
                : shape === "circle"
                  ? `gap-2 sm:gap-4 ${scrollable ? "flex-shrink-0" : ""} ${scrollable ? (mobileItemsPerView ? "" : "max-sm:w-[calc((100vw-44px)/3.3)]") : "w-full"}`
                  : `gap-1.5 sm:gap-2 ${scrollable ? "flex-shrink-0 w-[calc((100vw-44px)/3.3)]" : "w-full"}`
            } 
            ${
              isTopCategory
                ? `px-0.5 py-2 sm:px-2 sm:py-4 rounded-2xl ${
                    scrollable && (shape === "circle" || shape === "square")
                      ? "w-24 min-w-[96px] max-w-[96px] sm:w-32 sm:min-w-[128px] sm:max-w-[128px] lg:w-[150px] lg:min-w-[150px] lg:max-w-[150px] flex-shrink-0"
                      : ""
                  }`
                : asCategoryPageQuickLink && hasNoImages
                  ? "w-fit px-5 py-3 rounded-lg border border-charcoal-3/20"
                  : scrollable && (shape === "circle" || shape === "square") && !asCategoryPageQuickLink
                    ? "w-24 min-w-[96px] max-w-[96px] sm:w-32 sm:min-w-[128px] sm:max-w-[128px] lg:w-[150px] lg:min-w-[150px] lg:max-w-[150px] flex-shrink-0"
                    : scrollable
                      ? categoryList.length === 6
                        ? `w-full max-sm:py-2 ${
                            mobileItemsPerView
                              ? `max-sm:min-w-[calc((100dvw-32px)/3.4)] max-sm:max-w-[calc((100dvw-32px)/3.4)] sm:min-w-[calc((100dvw-48px)/3.5)] sm:max-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px] lg:max-w-none`
                              : shape === "circle" && !asCategoryPageQuickLink
                                ? "max-sm:min-w-[105px] sm:min-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px]"
                                : `max-sm:min-w-[calc((100dvw-80px)/1.8)] sm:min-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px]`
                          }`
                        : asCategoryPageQuickLink && shape === "circle"
                          ? `min-w-[calc((100dvw-80px)/1.8)] max-sm:py-2 sm:min-w-[240px] sm:max-w-[240px]`
                          : `max-sm:py-2 sm:min-w-[calc((100dvw-48px)/3.5)] sm:max-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px] lg:max-w-[150px] ${
                              mobileItemsPerView
                                ? `max-sm:min-w-[calc((100dvw-32px)/3.4)] max-sm:max-w-[calc((100dvw-32px)/3.4)] sm:min-w-[calc((100dvw-48px)/3.5)] sm:max-w-[calc((100dvw-48px)/3.5)] lg:min-w-0 lg:max-w-none`
                                : shape === "circle"
                                  ? "max-sm:min-w-[105px] sm:min-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px]"
                                  : `max-sm:min-w-[calc((100dvw-80px)/1.8)] sm:min-w-[calc((100dvw-48px)/3.5)] lg:min-w-[150px]`
                            }`
                      : ""
            } 
            ${!scrollable ? "max-w-[180px]" : ""} ${shape === "circle" && !isTopCategory ? "max-sm:mx-0" : ""} mx-auto
            ${hasNoImages ? "hover:bg-sienna-3/10 hover:border-sienna *:hover:text-sienna" : ""} 
            ${asCard && !isTopCategory ? "px-0.5 py-2 sm:px-2 sm:py-4 rounded-2xl" : ""} 
            transition-all duration-300`;

        if (link && link !== "#") {
          return (
            <Link href={link} key={_id || index} className={itemClassName}>
              {content}
            </Link>
          );
        }

        return (
          <div key={_id || index} className={itemClassName}>
            {content}
          </div>
        );
      })}

      {/* Invisible spacer div to prevent right-side clipping on mobile flex layouts */}
      {/* HIDDEN if isTopCategory is true so we don't accidentally create a blank grid item! */}
      {shape === "circle" && !asCategoryPageQuickLink && !isTopCategory && (
        <div
          className="sm:hidden flex-shrink-0 w-4 min-w-[16px]"
          aria-hidden="true"
        />
      )}

      {/* right button ------------------------- */}
      {scrollable || asCategoryPageQuickLink ? (
        <>
          {categoryList.length >
            (asCategoryPageQuickLink && shape === "circle" ? 4 : 6) && (
            <div
              className="max-sm:hidden max-w-10 w-9 h-9 sm:w-10 sm:h-10 sticky top-[40%] sm:top-1/2 aspect-square -translate-y-1/2 -right-1 sm:right-0 rounded-full cursor-pointer flex items-center justify-center bg-white/70 p-1.5 sm:p-2 backdrop-blur-md border border-neutral-200 text-slate-900 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 max-sm:ml-[-35px] ml-[-44px] z-50 shadow-lg"
              onClick={() => handleScroll("right")}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
