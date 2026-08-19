"use client";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import { BannerCarouselType } from "./static/types";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Banner from "./Banner/Banner";
import { SetStateType } from "@/common/types/reactTypes";

const manageCarouselCount = ({
  countManager,
  setCurrIndex,
}: {
  countManager: CarouselApi;
  setCurrIndex: SetStateType<number>;
}) => {
  if (!countManager) return;

  setCurrIndex((prev) => countManager.selectedScrollSnap());

  countManager.on("select", () => {
    setCurrIndex((prev) => countManager.selectedScrollSnap());
  });
};

export function Banners(config: BannerCarouselType) {
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [countManager, setCountManager] = useState<CarouselApi>();
  const [currIndex, setCurrIndex] = useState<number>(0);

  useEffect(
    () => manageCarouselCount({ countManager, setCurrIndex }),
    [countManager],
  );

  const filteredElements = config.elements.filter((el) => {
    return (
      (el.image.desktop.url && el.image.desktop.url.length > 0) ||
      (el.image.mobile.url && el.image.mobile.url.length > 0)
    );
  });

  const showBubbles = config.showBubbles || false;

  const hasDedicatedMobileBanners = filteredElements.some(
    (el) =>
      el.image?.mobile?.url &&
      el.image.mobile.url.trim().length > 0 &&
      el.image.mobile.url !== el.image?.desktop?.url
  );

  const { ratioType: type } = config;
  const dimensions =
    type === "default" || type === undefined
      ? hasDedicatedMobileBanners
        ? "aspect-[2/1] sm:aspect-[3/1]"
        : "aspect-[3/1]"
      : type === "large"
        ? "aspect-[3/2]"
        : type === "micro"
          ? "h-[90px]"
          : type === "mini"
            ? "h-[150px]"
            : "aspect-[1/1]";

  if (filteredElements.length === 0) return <></>;

  return (
    <Carousel
      plugins={config.autoScroll ? [plugin.current] : undefined}
      className={`grid *:row-start-1 *:col-start-1 w-full ${dimensions}`}
      opts={{
        loop: true,
      }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      setApi={setCountManager}
    >
      <CarouselContent className="z-10 ml-0 -ml-0">
        {filteredElements.map((el, index) => (
          <CarouselItem className={`overflow-hidden pl-0 rounded-2xl sm:rounded-3xl ${dimensions}`} key={index}>
            <Banner props={el} isPriority={config.priority && index === 0} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {showBubbles ? (
        <div className="z-20 h-fit w-fit relative left-1/2 -translate-x-1/2 flex items-center justify-center self-end gap-2 sm:gap-3">
          {Array.from({ length: filteredElements.length }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 sm:h-2 mb-2 rounded-full ${index === currIndex ? "aspect-[2.5/1] bg-charcoal-3/50" : "aspect-square bg-charcoal-3/20"} cursor-pointer backdrop-blur-md transition-all duration-300`}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <></>
      )}
    </Carousel>
  );
}
