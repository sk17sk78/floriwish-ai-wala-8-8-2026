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

// types
import { type BannerDocument } from "@/common/types/documentation/nestedDocuments/banner";

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

  // references
  const plugin = useRef(
    Autoplay({
      delay: scrollInterval * 1000 || 7000,
      stopOnInteraction: true
    })
  );

  // states
  const [countManager, setCountManager] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // memoizes
  const dimensions = useMemo(
    () =>
      type === "large"
        ? "aspect-[2/1] sm:aspect-[3/2]"
        : type === "micro"
          ? "aspect-[2/1] sm:h-[90px]"
          : type === "mini"
            ? "aspect-[2/1] sm:h-[150px] sm:scale-110"
            : type === "square"
              ? "aspect-[2/1] sm:aspect-[1/1]"
              : "aspect-[2/1] sm:aspect-[3/1]",
    [type]
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

  return (
    <div className={`py-2 max-sm:px-3.5 ${deviceVisibilityClass}`}>
      <Carousel
        plugins={autoScroll ? [plugin.current] : undefined}
        className={`grid *:row-start-1 *:col-start-1 w-full ${dimensions}`}
        opts={{
          loop: loopInfinitely
        }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setCountManager}
      >
        <CarouselContent className="z-10 ml-0 -ml-0">
          {(Array.isArray(images) ? images : []).map((image, i) => (
            <CarouselItem
              key={i}
              className={`overflow-hidden pl-0 rounded-2xl sm:rounded-3xl ${dimensions}`}
            >
              <CategoryBannerImage bannerImage={image} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {showIndicators && (
          <div className="z-20 h-fit w-fit relative left-1/2 -translate-x-1/2 flex items-center justify-center self-end gap-2 sm:gap-3">
            {Array.from({ length: (Array.isArray(images) ? images : []).length }).map((_, index) => (
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
  );
}

export default memo(CategoryBanner);
