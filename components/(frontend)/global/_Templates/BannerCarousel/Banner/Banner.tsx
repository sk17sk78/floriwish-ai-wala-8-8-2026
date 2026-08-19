// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

// types
import { type BannerCarouselElementsType } from "../static/types";

export default function Banner({
  props,
  isPriority = false,
}: {
  props: BannerCarouselElementsType;
  isPriority?: boolean;
}) {
  const desktopSrc = convertToCloudFrontUrl(props.image.desktop.url || props.image.mobile.url || "");
  const hasMobileImage = Boolean(
    props.image.mobile.url &&
    props.image.mobile.url.trim().length > 0 &&
    props.image.mobile.url !== props.image.desktop.url
  );
  const mobileSrc = hasMobileImage
    ? convertToCloudFrontUrl(props.image.mobile.url)
    : desktopSrc;
  const alt = props.image.desktop.alt || props.image.mobile.alt || "Banner Image";

  // Correct aspect-ratio derived width/height pairs:
  // Desktop (3:1)  → 1200×400
  // Mobile  (2:1)  → 800×400  (matches aspect-[2/1] carousel container)
  // Using explicit width+height tells the browser the intrinsic ratio BEFORE
  // the image downloads → CLS = 0.
  const desktopW = 1200;
  const desktopH = 400;
  const mobileW = 800;
  const mobileH = 400;

  const content = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100">
      <picture className="w-full h-full block">
        {hasMobileImage && (
          <source
            media="(max-width: 639px)"
            srcSet={mobileSrc}
            width={mobileW}
            height={mobileH}
          />
        )}
        <source
          media="(min-width: 640px)"
          srcSet={desktopSrc}
          width={desktopW}
          height={desktopH}
        />
        <img
          src={hasMobileImage ? mobileSrc : (desktopSrc || mobileSrc)}
          alt={alt}
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "low"}
          decoding={isPriority ? "sync" : "async"}
          width={hasMobileImage ? mobileW : desktopW}
          height={hasMobileImage ? mobileH : desktopH}
          sizes={
            hasMobileImage
              ? "(max-width: 639px) 100vw, 100vw"
              : "100vw"
          }
        />
      </picture>
    </div>
  );

  return props.isLink ? (
    <Link
      href={props.link}
      aria-label={alt || "Banner Link"}
      className="block w-full h-full"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export function CategoryListBanner(props: BannerCarouselElementsType) {
  const desktopSrc = convertToCloudFrontUrl(props.image.desktop.url || props.image.mobile.url || "");
  const alt = props.image.desktop.alt || props.image.mobile.alt || "Category Banner";

  return props.isLink ? (
    <div className="grid *:row-start-1 *:col-start-1 w-full aspect-[3/1]">
      <Link
        href={props.link}
        prefetch={false}
        className="block w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl"
        aria-label={alt}
      >
        <NextImage
          className="rounded-2xl sm:rounded-3xl object-cover h-full w-full"
          src={desktopSrc}
          alt={alt}
          width={1200}
          height={400}
          priority={true}
          sizes="100vw"
        />
      </Link>
    </div>
  ) : (
    <section className="w-full aspect-[3/1]">
      <NextImage
        className="rounded-2xl sm:rounded-3xl object-cover w-full h-full"
        src={desktopSrc}
        alt={alt}
        width={1200}
        height={400}
        quality={75}
        draggable={false}
        priority={true}
        sizes="100vw"
      />
    </section>
  );
}
