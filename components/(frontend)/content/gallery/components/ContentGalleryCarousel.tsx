"use client";

// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// utils
import { memo } from "react";

// hooks
import { useEffect, useState } from "react";

// Components
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import NextImage from "@/components/custom/NextImage";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

// types
import { type CarouselApi } from "@/components/ui/carousel";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentGalleryCarousel({
  images,
  activeIndex,
  onChangeActiveIndex
}: {
  activeIndex: number;
  images: ImageDocument[];
  onChangeActiveIndex: (activeIndex: number) => void;
}) {
  // states
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // hooks
  useEffect(() => {
    if (carouselApi) {
      carouselApi.scrollTo(activeIndex);
    }
  }, [activeIndex, carouselApi]);

  useEffect(() => {
    if (carouselApi) {
      onChangeActiveIndex(carouselApi.selectedScrollSnap());

      const handleSelect = () => {
        onChangeActiveIndex(carouselApi.selectedScrollSnap());
      };

      carouselApi.on("select", handleSelect);

      return () => {
        carouselApi.off("select", handleSelect);
      };
    }
  }, [carouselApi, onChangeActiveIndex]);

  const validImages = images.filter(img => img && img.url);

  // ── SSR first product image — LCP candidate ─────────────────────────────
  // Renders the first product image directly in HTML so PageSpeed/Googlebot
  // can detect it as an LCP element without waiting for JS.
  const firstImage = validImages[0];
  const firstUrl = convertToCloudFrontUrl(firstImage?.url || "");
  const firstAlt = firstImage?.alt || firstImage?.defaultAlt || "Product Image";
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative h-full w-full">
      {/* Static SSR first product image — LCP candidate (z-[1]) */}
      {firstUrl && (
        <div className="absolute inset-0 z-[1] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firstUrl}
            alt={firstAlt}
            width={720}
            height={800}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            decoding="sync"
            sizes="(max-width: 640px) 100vw, 50vw"
            className="h-full w-full object-cover object-center"
            style={{ display: "block" }}
          />
        </div>
      )}

      {/* Carousel progressively enhances on top (z-10) */}
      <div className="absolute inset-0 z-10">
        <Carousel
          className="h-full w-full"
          opts={{
            loop: true
          }}
          setApi={setCarouselApi}
        >
          <CarouselContent className="h-full ml-0 -ml-0">
            {validImages.map((image, index) => {
              const url = convertToCloudFrontUrl(image?.url || "");
              const alt = image?.alt || "";
              return (
                <CarouselItem
                  key={index}
                  className="h-full w-full pl-0 select-none overflow-hidden"
                >
                  <NextImage
                    src={url}
                    alt={alt || "Product Image"}
                    width={720}
                    height={800}
                    priority={index === 0}
                    quality={85}
                    draggable={false}
                    className="h-full w-full object-cover object-center"
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}

export default memo(ContentGalleryCarousel);
