// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type ClickableImageDocument } from "@/common/types/documentation/nestedDocuments/clickableImage";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import ShineAnimation from "@/components/(frontend)/global/_Templates/ShineAnimation/ShineAnimation";

export default function CategoryQuickLinkItem({
  index,
  noImage,
  quickLink: { _id, label, path, image },
  scrollable
}: {
  index: number;
  noImage: boolean;
  quickLink: ClickableImageDocument;
  scrollable?: boolean;
}) {
  return (
    <Link
      key={String(_id)}
      href={`${DOMAIN}${path}` || "#"}
      prefetch={false}
      className={`group flex items-center justify-center flex-col gap-2 sm:gap-3 ${noImage ? "w-fit px-5 py-3 rounded-lg border border-charcoal-3/20" : `max-sm:py-1.5 ${!!scrollable ? "w-[30%] shrink-0 sm:w-[16.6%] lg:w-[16.6%]" : "w-full"}`} ${noImage ? "hover:bg-sienna-3/10 hover:border-sienna *:hover:text-sienna" : ""} transition-all duration-300`}
    >
      {!noImage && (
        <div
          className={`relative overflow-hidden bg-transparent w-full rounded-xl aspect-square grid place-items-center mt-2 sm:mt-4`}
        >
          <NextImage
            src={(image as ImageDocument).url}
            alt={(image as ImageDocument).alt || label || "Link Image"}
            width={150}
            height={150}
            quality={50}
            priority={index < 3}
            draggable={false}
            className={`w-full h-full mix-blend-multiply object-cover object-center scale-105 group-hover:scale-100 transition-all duration-300 border border-transparent group-hover:border-sienna rounded-xl`}
          />
          <ShineAnimation />
        </div>
      )}
      {label && (
        <p
          className={`block text-center text-xs sm:text-sm md:text-base line-clamp-2 w-full max-w-full text-charcoal-3 font-medium transition-all duration-300 min-h-[2.5em] flex items-center justify-center px-1`}
        >
          {label}
        </p>
      )}
    </Link>
  );
}
