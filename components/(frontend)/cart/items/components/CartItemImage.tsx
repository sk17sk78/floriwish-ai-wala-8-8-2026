// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// icons
import {
  NonVegSymbol,
  VegSymbol
} from "@/components/(_common)/Symbols/Edibles";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";

export default function CartItemImage({
  contentName,
  contentPath,
  imageUrl,
  contentEdible
}: {
  contentName: string;
  contentPath: string;
  imageUrl: string;
  contentEdible?: EdibleDocument;
}) {
  return (
    <Link
      href={contentPath}
      className="relative block aspect-square rounded-xl sm:rounded-2xl overflow-hidden w-20 h-20 sm:w-28 sm:h-28 shrink-0 border border-zinc-100/80 shadow-2xs hover:opacity-95 transition-opacity"
    >
      <NextImage
        src={imageUrl}
        alt={contentName}
        width={300}
        height={300}
        className="w-full h-full object-cover object-center"
        draggable={false}
      />
      {/* {(contentEdible?.type === "veg" || contentEdible?.type === "non-veg") && (
        <span className="absolute top-1 sm:-top-1 max-sm:left-1 sm:-left-1">
          {contentEdible.type === "veg" ? (
            <VegSymbol className="w-[16px] sm:scale-[0.55]" />
          ) : (
            <NonVegSymbol className="w-[16px] sm:scale-[0.55]" />
          )}
        </span>
      )} */}
    </Link>
  );
}
