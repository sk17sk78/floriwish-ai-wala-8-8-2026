// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type BannerCarouselElementsType } from "../static/types";

export default function Banner({
  props,
  isPriority = false,
}: {
  props: BannerCarouselElementsType;
  isPriority?: boolean;
}) {
  const mobileSrc = props.image.mobile.url || props.image.desktop.url || "";
  const desktopSrc = props.image.desktop.url || props.image.mobile.url || "";
  const alt = props.image.desktop.alt || props.image.mobile.alt || "Banner Image";

  const content = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden">
      <picture className="w-full h-full block">
        <source media="(min-width: 640px)" srcSet={desktopSrc} />
        <source media="(max-width: 639px)" srcSet={mobileSrc} />
        <img
          src={mobileSrc}
          alt={alt}
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "low"}
          decoding="async"
          width={1200}
          height={400}
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
  return props.isLink ? (
    <div className="grid *:row-start-1 *:col-start-1 h-[180px] min-[450px]:h-[250px] md:h-[300px]">
      <Link
        href={props.link}
        prefetch={false}
        className={`block w-full overflow-hidden`}
        aria-label={props.image.desktop.alt || "Category Banner Link"}
      >
        <NextImage
          className={`sm:rounded-3xl object-cover h-full w-full`}
          src={props.image.desktop.url || ""}
          alt={props.image.desktop.alt || "Banner Image"}
          width={1200}
          height={480}
          priority={true}
          sizes="100vw"
        />
      </Link>
    </div>
  ) : (
    <section>
      <NextImage
        className={`sm:rounded-3xl object-cover w-full aspect-[3/1] sm:aspect-[9/2] md:aspect-[6/1]`}
        src={props.image.desktop.url || ""}
        alt={props.image.desktop.alt || "Banner Image"}
        width={1200}
        height={480}
        quality={75}
        draggable={false}
        priority={true}
        sizes="100vw"
      />
    </section>
  );
}
