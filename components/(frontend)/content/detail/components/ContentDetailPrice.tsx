// icons
import { INRSymbol } from "@/common/constants/symbols";

// utils
import { getContentPrice } from "../../utils/getContentPrice";
import { memo } from "react";

// hooks
import { useMemo } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import ContentHorizontalSpacing from "../../spacing/ContentHorizontalSpacing";

// types
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";

function ContentDetailPrice({
  price: contentPrice,
}: {
  price: ContentPriceDocument;
}) {
  // hooks
  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  // memoized
  const { mrp, price } = useMemo(
    () =>
      getContentPrice({
        price: contentPrice,
        city: selectedCity,
      }),
    [contentPrice, selectedCity],
  );

  return (
    <>
      <ContentHorizontalSpacing className="flex items-baseline justify-start gap-2.5">
        <h2 className="text-xl font-semibold tracking-[-0.04em] text-zinc-800">
          {`${INRSymbol}${price}`}
        </h2>
        {price < mrp && (
          <>
            <del className="text-sm font-medium text-zinc-500">{`${INRSymbol} ${mrp}`}</del>
            <div className="rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              {`${Math.min(99, Math.ceil(100 - (price * 100) / mrp))}% OFF`}
            </div>
          </>
        )}
      </ContentHorizontalSpacing>
    </>
  );
}

export default memo(ContentDetailPrice);
