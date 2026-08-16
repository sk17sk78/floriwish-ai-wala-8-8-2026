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
      className={`group flex items-center justify-start flex-col gap-1.5 sm:gap-2.5 ${
        noImage
          ? "w-fit px-4 py-2 sm:px-5 sm:py-3 rounded-lg border border-charcoal-3/20"
          : scrollable
            ? "max-sm:w-[calc((100vw-50px)/3.5)] max-sm:min-w-[calc((100vw-50px)/3.5)] max-sm:max-w-[calc((100vw-50px)/3.5)] shrink-0 sm:w-[105px] md:w-[120px] lg:w-[130px] snap-start"
            : "w-full sm:w-[105px] md:w-[120px] lg:w-[130px]"
      } ${noImage ? "hover:bg-sienna-3/10 hover:border-sienna *:hover:text-sienna" : ""} transition-all duration-300`}
      style={{ WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}
    >
      {!noImage && (
        <div
          className="relative overflow-hidden bg-transparent w-full rounded-xl aspect-square grid place-items-center mt-1 sm:mt-2"
        >
          <NextImage
            src={(image as ImageDocument).url}
            alt={(image as ImageDocument).alt || label || "Link Image"}
            width={160}
            height={160}
            sizes="(max-width: 640px) 100px, (max-width: 1024px) 140px, 160px"
            quality={75}
            priority={index < 4}
            draggable={false}
            className="w-full h-full mix-blend-multiply object-cover object-center scale-105 group-hover:scale-100 transition-all duration-300 border border-transparent group-hover:border-sienna rounded-xl"
          />
          <ShineAnimation />
        </div>
      )}
      {label && (
        <p
          className="block text-center text-[11px] sm:text-xs md:text-sm line-clamp-2 w-full max-w-full text-charcoal-3 font-medium transition-all duration-300 min-h-[2.4em] flex items-center justify-center px-0.5 leading-tight"
        >
          {label}
        </p>
      )}
    </Link>
  );
}
