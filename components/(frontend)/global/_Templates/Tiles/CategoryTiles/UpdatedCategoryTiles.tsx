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
  shape = "circle",
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
  shape?: "circle" | "square";
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

  return (
    <div
      ref={trayRef}
      className={`${
        isTopCategory && !scrollable
          ? `grid responsive-grid gap-x-3 gap-y-4 px-4 py-4 lg:grid lg:justify-center lg:justify-items-center lg:px-0 lg:py-0`
          : scrollable
            ? `relative flex items-center flex-nowrap justify-start overflow-x-auto scrollbar-hide scroll-smooth snap-x touch-pan-x px-4 sm:px-6 lg:px-0 py-2.5 sm:py-3 ${
                shape === "circle" ? "gap-x-3 sm:gap-x-5 lg:gap-x-4" : "gap-x-3 sm:gap-x-4 lg:gap-x-4"
              }`
            : hasNoImages
              ? `flex items-center justify-start gap-x-2 *:max-sm:px-2 *:px-4 *:py-1.5 *:rounded-xl *:transition-all *:duration-300`
              : `${!scrollable ? "grid responsive-grid gap-x-4 gap-y-6 px-4" : "flex flex-nowrap overflow-x-auto scrollbar-hide scroll-smooth snap-x touch-pan-x " + (shape === "circle" ? "pl-4" : "px-4")} py-4 scrollbar-hide lg:grid lg:justify-center lg:justify-items-center lg:px-0 lg:py-0`
      } ${
        isTopCategory
          ? ""
          : shape === "circle"
            ? `${scrollable ? "" : "gap-x-6 gap-y-6 sm:gap-x-12 lg:gap-x-16 sm:gap-y-8 sm:px-3 sm:py-3"}`
            : `${scrollable ? "" : "gap-x-4 gap-y-2.5 sm:gap-x-4"}`
      } ${asCategoryPageQuickLink ? "pl-3" : ""} w-full transition-all duration-300 scrollbar-hide ${className || ""}`}
      style={
        !scrollable
          ? ({
              "--cols-mobile": columns === 8 || categoryList.length === 8 ? 4 : (categoryList.length >= 6 ? 3 : (columns || 3)),
              "--cols-tablet": columns || (categoryList.length >= 8 ? 8 : (categoryList.length >= 6 ? 6 : 4)),
              "--cols-desktop": columns || (categoryList.length >= 8 ? 8 : (categoryList.length >= 6 ? 6 : 4)),
            } as React.CSSProperties)
          : ({
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y",
            } as React.CSSProperties)
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
                className={`relative bg-transparent w-full ${
                  asCategoryPageQuickLink
                    ? "rounded-lg aspect-[4/3] sm:aspect-video overflow-hidden"
                    : shape === "circle"
                      ? `rounded-full aspect-square p-[2.5px] sm:p-[3.5px] ring-2 sm:ring-3 transition-all duration-300 ${
                          isTopCategory ? "ring-[#fce7f3]" : "ring-sienna/60 group-hover:ring-sienna"
                        }`
                      : "rounded-2xl aspect-square overflow-hidden"
                } grid place-items-center relative`}
              >
                <div className={`relative w-full h-full ${shape === "circle" ? "rounded-full" : "rounded-2xl"} overflow-hidden`}>
                  <OptimizedImage
                    src={
                      url ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
                    }
                    alt={alt || "Category Image"}
                    fill
                    quality={65}
                    draggable={false}
                    priority={Boolean(isTopCategory && index < 4)}
                    sizes="(max-width: 640px) 25vw, 150px"
                    className="absolute inset-0 overflow-hidden"
                    imageClassName={`object-cover object-center ${isTopCategory ? "scale-100" : "scale-105"} sm:scale-100 group-hover:scale-100 sm:group-hover:scale-95 transition-all duration-300 ${
                      shape === "circle"
                        ? "rounded-full"
                        : "rounded-2xl"
                    }`}
                  />
                  <ShineAnimation />
                </div>
              </div>
            )}
            {label && label.length > 0 ? (
              <h2
                className="w-full text-center leading-none text-zinc-800 font-poppins font-medium whitespace-nowrap overflow-hidden text-ellipsis max-sm:text-[10.5px] sm:text-[12px] md:text-[13px] tracking-tight transition-all duration-300"
                title={label}
              >
                {label}
              </h2>
            ) : (
              <></>
            )}
          </>
        );

        const itemClassName = `group flex items-center justify-start flex-col gap-1.5 sm:gap-2.5 mx-auto transition-all duration-300 ${
          scrollable
            ? "flex-shrink-0 max-sm:min-w-[calc((100vw-68px)/3.5)] max-sm:max-w-[calc((100vw-68px)/3.5)] sm:min-w-[calc((100vw-48px)/4.5)] sm:max-w-[calc((100vw-48px)/4.5)] lg:min-w-[calc((1200px-96px)/6.5)] lg:max-w-[calc((1200px-96px)/6.5)]"
            : "w-full max-w-[180px]"
        } ${
          isTopCategory
            ? `px-0.5 py-2 sm:px-2 sm:py-4 rounded-2xl`
            : asCategoryPageQuickLink && hasNoImages
              ? "w-fit px-5 py-3 rounded-lg border border-charcoal-3/20"
              : asCard && !isTopCategory
                ? "px-0.5 py-2 sm:px-2 sm:py-4 rounded-2xl"
                : ""
        }`;

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
