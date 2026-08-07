// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// icons
import { Check } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";

// utils
import { memo } from "react";
import { getContentPrice } from "../../utils/getContentPrice";

// hooks
import { useMemo } from "react";

// components
import NextImage from "@/components/custom/NextImage";

// types
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryOptionDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategoryOption";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type UnitDocument } from "@/common/types/documentation/presets/unit";

function ContentDetailCustomVariant({
  options,
  unit,
  variant,
  isSelected,
  onClick
}: {
  options: ContentCustomVariantCategoryOptionDocument;
  unit: UnitDocument | undefined;
  variant: ContentCustomVariantDocument;
  isSelected: boolean;
  onClick: () => void;
}) {
  const label = useMemo(
    () =>
      options.unit
        ? `${variant.value as number} ${(unit as UnitDocument).abbr}`
        : (variant.label as string),
    [options, unit, variant]
  );

  const image = useMemo(
    () => (options.image ? (variant.image as ImageDocument) : undefined),
    [options, variant]
  );

  const { price } = useMemo(
    () =>
      getContentPrice({
        price: variant.price,
        city: null
      }),
    [variant]
  );

  return (
    <div
      role="button"
      className={`relative flex h-full cursor-pointer flex-col items-center gap-1.5 overflow-hidden rounded-xl border p-1.5 transition-all duration-200 sm:p-2 ${
        isSelected
          ? "border-moss bg-white shadow-sm ring-1 ring-moss/20 sm:bg-moss/5 sm:ring-0"
          : "border-zinc-100 bg-white hover:border-moss/20"
      }`}
      onClick={onClick}
    >
      {/* CHECKBOX CIRCLE */}
      <div
        className={`absolute top-2 right-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 z-[1] ${
          isSelected ? "border-moss bg-moss text-white" : "border-zinc-200 bg-white sm:border-zinc-300"
        }`}
      >
        {isSelected ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-2.5 w-2.5 sm:h-3 sm:w-3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <div className="h-2 w-2 rounded-full bg-zinc-100 sm:hidden" />
        )}
      </div>

      {/* IMAGE CONTAINER */}
      {image && (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 sm:shrink-0 sm:bg-zinc-100">
          <NextImage
            src={image.url}
            alt={image.alt || image.defaultAlt || "Variant Image"}
            width={120}
            height={120}
            quality={50}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* TEXT CONTAINER */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-[12px] font-semibold text-zinc-600 line-clamp-1 sm:text-[13px] sm:text-zinc-700">
          {label}
        </span>
        <span className="text-[13px] font-bold text-zinc-900">
          {INRSymbol}
          {price}
        </span>
      </div>
    </div>
  );
}

export default memo(ContentDetailCustomVariant);
