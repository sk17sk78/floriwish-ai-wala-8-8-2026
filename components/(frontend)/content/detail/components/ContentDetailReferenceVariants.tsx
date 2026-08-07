// utils
import { memo, useState } from "react";

// hooks
import { useMemo } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import ContentDetailReferenceVariant from "./ContentDetailReferenceVariant";

// type
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentVariantCategory";
import { type LabelDocument } from "@/common/types/documentation/presets/label";

function ContentDetailReferenceVariants({
  variantCategory,
  activeVariantId,
  onChange
}: {
  variantCategory: ContentVariantCategoryDocument;
  activeVariantId: string | null;
  onChange: (referenceVariant: ContentDocument | null) => void;
}) {
  const label = useMemo(
    () => (variantCategory.label as LabelDocument).label,
    [variantCategory]
  );

  const variants = useMemo(() => variantCategory.reference!, [variantCategory]);

  // hooks
  const { isMobile } = useAppStates();

  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex flex-col items-stretch justify-start gap-4 rounded-2xl bg-[#fff5f8]/50 p-4 sm:p-6 sm:border sm:border-[#ffe4ee]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-zinc-800">
          Add More to Celebration
        </h3>
        <span className="text-[11px] font-medium text-zinc-500 capitalize">
          Select {label}
        </span>
      </div>
      <div className="flex flex-nowrap items-stretch gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0 sm:mt-1">
        {variants
          .map((variant, i) => (
            <div
              key={String(variant._id)}
              className="w-[85px] shrink-0 sm:w-[210px]"
            >
              <ContentDetailReferenceVariant
                variant={variant}
                isSelf={!i}
                isSelected={
                  activeVariantId
                    ? String((variant.reference as ContentDocument)._id) === String(activeVariantId)
                    : !i
                }
                onClick={onChange}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default memo(ContentDetailReferenceVariants);
