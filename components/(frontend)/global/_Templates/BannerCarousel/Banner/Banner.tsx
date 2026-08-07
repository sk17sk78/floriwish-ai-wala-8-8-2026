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
  return props.isLink ? (
    <Link
      href={props.link}
      aria-label={
        props.image.desktop.alt || props.image.mobile.alt || "Banner Link"
      }
      className="block w-full h-full"
    >
      <NextImage
        className={`sm:hidden object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl`}
        src={props.image.mobile.url || ""}
        alt={props.image.mobile.alt || "Banner Image"}
        width={480}
        height={240}
        priority={isPriority}
        quality={75}
        sizes="100vw"
      />
      <NextImage
        className={`max-sm:hidden object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl`}
        src={props.image.desktop.url || ""}
        alt={props.image.desktop.alt || "Banner Image"}
        width={1200}
        height={400}
        priority={isPriority}
        quality={75}
        sizes="100vw"
      />
    </Link>
  ) : (
    <>
      <NextImage
        className={`sm:hidden object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl`}
        src={props.image.mobile.url || ""}
        alt={props.image.mobile.alt || "Banner Image"}
        width={480}
        height={240}
        priority={isPriority}
        quality={75}
        sizes="100vw"
      />
      <NextImage
        className={`max-sm:hidden object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl`}
        src={props.image.desktop.url || ""}
        alt={props.image.desktop.alt || "Banner Image"}
        width={1200}
        height={400}
        priority={isPriority}
        quality={75}
        sizes="100vw"
      />
    </>
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
          quality={75}
          draggable={false}
          priority={false}
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
        priority={false}
        sizes="100vw"
      />
    </section>
  );
}
