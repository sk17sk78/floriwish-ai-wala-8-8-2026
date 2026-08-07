import OptimizedImage from "@/components/ui/optimized-image";
import { Check } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";
import { memo } from "react";

import { type ContentEnhancementItemDocument } from "@/common/types/documentation/nestedDocuments/contentEnhancementItem";
import { type EnhancementDocument } from "@/common/types/documentation/presets/enhancement";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentCustomizeEnhancementItem({
  enhancementItem: { enhancement, price },
  isSelected,
  onClick
}: {
  enhancementItem: ContentEnhancementItemDocument;
  isSelected: boolean;
  onClick: () => void;
}) {
  const imageObj = (enhancement as EnhancementDocument)?.image as ImageDocument;
  const imageUrl = imageObj?.url || "";
  const imageAlt = imageObj?.alt || (enhancement as EnhancementDocument)?.label || "Enhancement Image";
  const labelText = (enhancement as EnhancementDocument)?.label || "";

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between gap-3 p-3 rounded-[20px] border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "border-moss bg-moss/5 shadow-sm ring-1 ring-moss/50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {imageUrl ? (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] overflow-hidden shrink-0 bg-zinc-100 border border-zinc-100">
            <OptimizedImage
              src={imageUrl}
              alt={imageAlt}
              width={100}
              height={100}
              draggable={false}
              className="w-full h-full"
              imageClassName="w-full h-full object-cover object-center"
            />
          </div>
        ) : null}
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <span className="text-[13px] sm:text-[14px] font-bold text-zinc-900 leading-tight line-clamp-2">
            {labelText}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-zinc-900 mt-1">
            {INRSymbol}{price}
          </span>
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center shrink-0 ${
          isSelected
            ? "border-moss bg-moss text-white shadow-2xs scale-105"
            : "border-zinc-300 bg-white group-hover:border-zinc-400"
        }`}
      >
        {isSelected && <Check width={12} height={12} strokeWidth={3} />}
      </div>
    </div>
  );
}

export default memo(ContentCustomizeEnhancementItem);
