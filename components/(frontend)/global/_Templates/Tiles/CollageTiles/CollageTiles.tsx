import NextImage from "@/components/custom/NextImage";
import { CollageDataType, CollageLayoutType } from "./static/types";
import Link from "next/link";
import { ClassNameType } from "@/common/types/reactTypes";
import { OPTIMIZE_IMAGE } from "@/config/image";

const simpleLayouts: CollageLayoutType[] = ["l1-m0-r4", "l2-m1-r2", "l4-m0-r1"];

export const getLayout = (
  layoutType: CollageLayoutType,
  index: number,
  asSticker?: boolean,
): string => {
  // ====[ SIMPLE LAYOUTS ]=====================================================
  const defaultConfig = "aspect-video";

  if (layoutType === "l1-m0-r4")
    switch (index) {
      case 0:
        return "col-span-2 row-span-2 aspect-video";
      case 1:
        return defaultConfig;
      case 2:
        return defaultConfig;
      case 3:
        return defaultConfig;
      case 4:
        return defaultConfig;
    }

  if (layoutType === "l4-m0-r1")
    switch (index) {
      case 0:
        return defaultConfig;
      case 1:
        return defaultConfig;
      case 2:
        return "col-span-2 row-span-2 max-sm:row-start-3 aspect-video";
      case 3:
        return defaultConfig;
      case 4:
        return defaultConfig;
    }

  if (layoutType === "l2-m1-r2")
    switch (index) {
      case 0:
        return defaultConfig;
      case 1:
        return "row-span-2 col-span-2 max-sm:row-start-2 aspect-video";
      case 2:
        return "aspect-video max-sm:row-start-1 max-sm:col-start-2";
      case 3:
        return defaultConfig;
      case 4:
        return defaultConfig;
    }

  // ====[ COMPLEX LAYOUTS ]=====================================================
  if (layoutType === "lt1-lb2-rt1-rb2")
    switch (index) {
      case 0:
        return `${asSticker ? "aspect-[2/1]" : "aspect-[9/22]"} col-span-2`;
      case 1:
        return `${asSticker ? "aspect-[2/1]" : "aspect-[9/22]"} col-span-2`;
      case 2:
        return "aspect-square";
      case 3:
        return "aspect-square";
      case 4:
        return "aspect-square";
      case 5:
        return "aspect-square";
    }

  if (layoutType === "lt2-lb1-rt2-rb1")
    switch (index) {
      case 0:
        return "aspect-square";
      case 1:
        return "aspect-square";
      case 2:
        return "aspect-square";
      case 3:
        return "aspect-square";
      case 4:
        return `${asSticker ? "aspect-[9/22]" : "aspect-[2/1]"} col-span-2`;
      case 5:
        return `${asSticker ? "aspect-[9/22]" : "aspect-[2/1]"} col-span-2`;
    }

  return "";
};

export const getGridLayout = (layoutType: CollageLayoutType) =>
  simpleLayouts.includes(layoutType)
    ? "grid gap-2 sm:gap-4 px-1.5 sm:px-0 grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2"
    : "grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4 grid-rows-[auto_auto_auto_auto] sm:grid-rows-[auto_auto]";

const isImgWithinThreshold = (layoutType: CollageLayoutType, index: number) =>
  simpleLayouts.includes(layoutType) ? index < 5 : index < 6;

export default function CollageTiles({
  tiles,
  className,
  asPreview,
}: {
  tiles: CollageDataType;
  className?: ClassNameType;
  asPreview?: boolean;
}) {
  const layoutType = tiles.layoutType;

  return (
    <section
      className={`${getGridLayout(layoutType)} ${className || ""} ${asPreview ? "!gap-1" : ""}`}
    >
      {tiles.contents
        .filter((_, index) => isImgWithinThreshold(layoutType, index))
        .map(({ image, title, description, link }, index) => (
          <Link
            href={link}
            key={index}
            className={`group relative grid ${getLayout(layoutType, index, asPreview || false)} *:row-start-1 *:col-start-1 overflow-hidden ${asPreview ? "rounded-lg" : "rounded-lg sm:rounded-2xl"} border-[1.5px] border-transparent hover:border-sienna transition-all duration-300`}
          >
            <NextImage
              alt={image.alt}
              src={image.url}
              width={500}
              height={500}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 500px"
              priority={index < 2}
              quality={50}
              draggable={false}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-all duration-500"
            />

            <div className="absolute h-full -left-[35%] w-7 scale-y-110 bg-ivory-1/85 opacity-60 rotate-12 blur-sm z-30 top-0 transition-all duration-500 group-hover:animate-shine" />
          </Link>
        ))}
    </section>
  );
}
