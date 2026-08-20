"use client";

// libraries
import Autoplay from "embla-carousel-autoplay";

// utils
import { memo } from "react";

// hooks
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// components
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import CategoryBannerImage from "./CategoryBannerImage";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";
import Link from "next/link";

// types
import { type BannerDocument } from "@/common/types/documentation/nestedDocuments/banner";
import { type BannerImageDocument } from "@/common/types/documentation/nestedDocuments/bannerImage";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function CategoryBanner({
  banner
}: {
  banner: BannerDocument & { targetDevice?: "all" | "desktop" | "mobile" };
}) {
  const {
    type,
    autoScroll,
    scrollInterval,
    loopInfinitely,
    showIndicators,
    images,
    targetDevice = "all"
  } = banner;

  const deviceVisibilityClass =
    targetDevice === "desktop"
      ? "max-sm:hidden"
      : targetDevice === "mobile"
      ? "sm:hidden"
      : "";

  /**
   * TBT Optimisation: Same as homepage carousel — defer autoplay until idle.
   */
  const [autoplayReady, setAutoplayReady] = useState(false);

  // references
  const plugin = useRef(
    Autoplay({
      delay: (scrollInterval ? scrollInterval * 1000 : undefined) || 7000,
      stopOnInteraction: true
    })
  );

  // states
  const [countManager, setCountManager] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const hasDedicatedMobileImages = (Array.isArray(images) ? images : []).some(
    (img: any) =>
      img?.mobile?.url &&
      img.mobile.url.trim().length > 0 &&
      img.mobile.url !== img?.desktop?.url
  );

  // memoizes
  const dimensions = useMemo(
    () =>
      type === "large"
        ? "aspect-[3/2]"
        : type === "micro"
          ? "h-[90px]"
          : type === "mini"
            ? "h-[150px]"
            : type === "square"
              ? "aspect-[1/1]"
              : hasDedicatedMobileImages
                ? "aspect-[2/1] sm:aspect-[3/1]"
                : "aspect-[3/1]",
    [type, hasDedicatedMobileImages]
  );

  // utils
  const manageCarouselCount = useCallback(
    ({
      countManager,
      onChangeActiveIndex
    }: {
      countManager: CarouselApi;
      onChangeActiveIndex: (activeIndex: number) => void;
    }) => {
      if (countManager) {
        onChangeActiveIndex(countManager.selectedScrollSnap());

        countManager.on("select", () => {
          onChangeActiveIndex(countManager.selectedScrollSnap());
        });
      }
    },
    []
  );

  // side effects
  useEffect(() => {
    manageCarouselCount({ countManager, onChangeActiveIndex: setActiveIndex });
  }, [manageCarouselCount, countManager]);

  // Defer autoplay until browser is idle — reduces TBT on mobile
  useEffect(() => {
    if (!autoScroll) return;
    const ric =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as any).requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 300);
    const handle = ric(() => setAutoplayReady(true));
    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(handle);
      }
    };
  }, [autoScroll]);

  // ── SSR static first image (LCP candidate) ──────────────────────────────
  const validImages = Array.isArray(images) ? images : [];
  const firstImg = validImages[0] as (BannerImageDocument & { desktop?: ImageDocument; mobile?: ImageDocument }) | undefined;
  const firstDeskUrl = convertToCloudFrontUrl(
    (firstImg?.desktop as ImageDocument)?.url || (firstImg?.mobile as ImageDocument)?.url || ""
  );
  const firstMobDoc = firstImg?.mobile as ImageDocument | undefined;
  const hasMobileFirst = Boolean(
    firstMobDoc?.url &&
    firstMobDoc.url.trim().length > 0 &&
    firstMobDoc.url !== (firstImg?.desktop as ImageDocument)?.url
  );
  const firstMobUrl = hasMobileFirst
    ? convertToCloudFrontUrl(firstMobDoc?.url || "")
    : firstDeskUrl;
  const firstAlt =
    (firstImg?.desktop as ImageDocument)?.alt ||
    (firstImg?.desktop as ImageDocument)?.defaultAlt ||
    (firstImg?.mobile as ImageDocument)?.alt ||
    "Category Banner";
  const hasFirstImage = Boolean(firstDeskUrl || firstMobUrl);

  const staticFirstImage = hasFirstImage ? (
    firstImg?.path ? (
      <Link
        href={firstImg.path}
        prefetch={false}
        className="absolute inset-0 z-[1] block rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100"
        aria-label={firstAlt}
      >
        <picture className="w-full h-full block">
          {hasMobileFirst && (
            <source media="(max-width: 639px)" srcSet={firstMobUrl} width={800} height={400} />
          )}
          <source media="(min-width: 640px)" srcSet={firstDeskUrl} width={1200} height={400} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasMobileFirst ? firstMobUrl : firstDeskUrl}
            alt={firstAlt}
            width={hasMobileFirst ? 800 : 1200}
            height={400}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            decoding="sync"
            sizes="100vw"
            className="w-full h-full object-cover object-center"
            style={{ display: "block" }}
          />
        </picture>
      </Link>
    ) : (
      <div className="absolute inset-0 z-[1] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100">
        <picture className="w-full h-full block">
          {hasMobileFirst && (
            <source media="(max-width: 639px)" srcSet={firstMobUrl} width={800} height={400} />
          )}
          <source media="(min-width: 640px)" srcSet={firstDeskUrl} width={1200} height={400} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasMobileFirst ? firstMobUrl : firstDeskUrl}
            alt={firstAlt}
            width={hasMobileFirst ? 800 : 1200}
            height={400}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            decoding="sync"
            sizes="100vw"
            className="w-full h-full object-cover object-center"
            style={{ display: "block" }}
          />
        </picture>
      </div>
    )
  ) : null;
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className={`py-2 max-sm:px-3.5 ${deviceVisibilityClass}`}>
      {/* Outer relative container so SSR image + carousel share same space */}
      <div className={`relative w-full ${dimensions}`}>
        {/* Static SSR first image — LCP candidate (no JS required) */}
        {staticFirstImage}

        {/* Carousel as progressive enhancement at z-10 */}
        <div className="absolute inset-0 z-10">
          <Carousel
            plugins={autoScroll && autoplayReady ? [plugin.current] : undefined}
            className={`grid *:row-start-1 *:col-start-1 w-full h-full`}
            opts={{
              loop: loopInfinitely
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            setApi={setCountManager}
          >
            <CarouselContent className="z-10 ml-0 -ml-0 h-full">
              {validImages.map((image, i) => (
                <CarouselItem
                  key={i}
                  className={`overflow-hidden pl-0 rounded-2xl sm:rounded-3xl h-full`}
                >
                  {/* isPriority=true only for first image so it loads eagerly */}
                  <CategoryBannerImage bannerImage={image} isPriority={i === 0} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {showIndicators && (
              <div className="z-20 h-fit w-fit relative left-1/2 -translate-x-1/2 flex items-center justify-center self-end gap-2 sm:gap-3">
                {Array.from({ length: validImages.length }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 sm:h-2 mb-2 rounded-full ${index === activeIndex ? "aspect-[2.5/1] bg-charcoal-3/50" : "aspect-square bg-charcoal-3/20"} cursor-pointer backdrop-blur-md transition-all duration-300`}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export default memo(CategoryBanner);
