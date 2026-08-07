// utils
import { lazy, memo, Suspense, useState } from "react";

// hooks
import { useMemo } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import ContentDetailCustomVariant from "./ContentDetailCustomVariant";
const LazyContentDetailServingInfoDialog = lazy(
  () => import("./ContentDetailServingDialog")
);

// types
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategory";
import { type ContentVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentVariantCategory";
import { type LabelDocument } from "@/common/types/documentation/presets/label";
import { type UnitDocument } from "@/common/types/documentation/presets/unit";
import { type UnitServeDocument } from "@/common/types/documentation/nestedDocuments/unitServe";

function ContentDetailCustomVariants({
  variantCategory,
  activeVariantId,
  onChange
}: {
  variantCategory: ContentVariantCategoryDocument;
  activeVariantId: string | null;
  onChange: (customVariantId: string | null) => void;
}) {
  const label = useMemo(
    () => (variantCategory.label as LabelDocument).label,
    [variantCategory]
  );

  const customVariantCategory = useMemo(
    () => variantCategory.custom as ContentCustomVariantCategoryDocument,
    [variantCategory]
  );

  const options = useMemo(
    () => customVariantCategory.options,
    [customVariantCategory]
  );

  const unit = useMemo(
    () =>
      options.unit ? (customVariantCategory.unit as UnitDocument) : undefined,
    [customVariantCategory, options]
  );

  const serves = useMemo(() => unit?.serves, [unit]);

  const variants = useMemo(
    () => customVariantCategory.variants as ContentCustomVariantDocument[],
    [customVariantCategory]
  );


  // hooks
  const { isMobile } = useAppStates();

  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex flex-col items-stretch justify-start gap-4 rounded-2xl bg-[#fff5f8]/50 p-4 sm:p-6 sm:border sm:border-[#ffe4ee]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-zinc-800">
          Add More to Celebration
        </h3>
        <span className="text-[11px] font-medium text-zinc-500">
          Select {label}
        </span>
      </div>
      <div className="flex flex-nowrap items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0 sm:mt-1">
        {variants
          .map((variant, i) => (
            <div
              key={String(variant._id)}
              className="w-[75px] shrink-0 sm:w-[115px]"
            >
              <ContentDetailCustomVariant
                options={options}
                unit={unit}
                variant={variant}
                isSelected={activeVariantId ? String(variant._id) === String(activeVariantId) : !i}
                onClick={() => {
                  onChange(i ? (String(variant._id)) : null);
                }}
              />
            </div>
          ))}
      </div>
      {unit && Boolean(serves?.length) && (
        <Suspense fallback={<></>}>
          <LazyContentDetailServingInfoDialog
            serves={serves as UnitServeDocument[]}
            unit={unit as UnitDocument}
          />
        </Suspense>
      )}
    </div>
  );

  /* return (
    <div className="bg-ivory-1 relative shadow-light sm:rounded-3xl pt-5 pb-5 border-y sm:border border-ash/40 px-4 sm:px-6 sm:max-w-[calc(470px_+_24px)]">
      <span className="text-charcoal-3/80 text-base font-medium mb-5 relative flex items-center justify-start gap-0.5">
        {label}
        <span className={`absolute -bottom-1.5 left-0 bg-sienna h-[2px] w-20`} />
      </span>
      <div className="flex flex-col gap-1.5 mt-4 items-stretch justify-start">
        <div className="flex items-start justify-start gap-4 overflow-x-scroll scrollbar-hide">
          {variants.map((variant, i) => (
            <ContentDetailCustomVariant
              key={String(variant._id)}
              options={options}
              unit={unit}
              variant={variant}
              isSelected={
                activeVariantId ? String(variant._id) === String(activeVariantId) : !i
              }
              onClick={() => {
                onChange(i ? (String(variant._id)) : null);
              }}
            />
          ))}
        </div>
      </div>
      {unit && Boolean(serves?.length) && (
        <Suspense fallback={<></>}>
          <LazyContentDetailServingInfoDialog
            serves={serves as UnitServeDocument[]}
            unit={unit as UnitDocument}
          />
        </Suspense>
      )}
    </div>
  ); */
}

export default memo(ContentDetailCustomVariants);
