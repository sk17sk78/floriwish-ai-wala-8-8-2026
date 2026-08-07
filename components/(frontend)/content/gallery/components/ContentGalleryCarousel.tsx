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

  return (
    <Carousel
      className="h-full w-full"
      opts={{
        loop: true
      }}
      setApi={setCarouselApi}
    >
      <CarouselContent>
        {images.filter(img => img && img.url).map((image, index) => {
          const url = image?.url || "";
          const alt = image?.alt || "";
          return (
            <CarouselItem
              key={index}
              className="grid h-full w-full place-items-center"
            >
              <NextImage
                src={url}
                alt={alt || "Content Image"}
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
  );
}

export default memo(ContentGalleryCarousel);
