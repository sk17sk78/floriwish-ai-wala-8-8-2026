// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// requests
import { fetchContentPageReference } from "@/request/content/contentPageReference";

// icons
import { Check } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";

// utils
import { memo, useCallback, useState } from "react";
import { getContentPrice } from "../../utils/getContentPrice";

// hooks
import { useMemo } from "react";

// components
import NextImage from "@/components/custom/NextImage";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentReferenceVariantDocument } from "@/common/types/documentation/nestedDocuments/contentReferenceVariant";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentDetailReferenceVariant({
  variant: { label, reference },
  isSelf,
  isSelected,
  onClick
}: {
  variant: ContentReferenceVariantDocument;
  isSelf: boolean;
  isSelected: boolean;
  onClick: (reference: ContentDocument | null) => void;
}) {
  // states
  const [content, setContent] = useState<ContentDocument | null>(null);

  // memoized
  const referenceContent = useMemo(
    () => reference as ContentDocument,
    [reference]
  );

  const { alt, defaultAlt, url } = useMemo(
    () => referenceContent.media.primary as ImageDocument,
    [referenceContent]
  );

  const { price } = useMemo(
    () =>
      getContentPrice({
        price: referenceContent.price!,
        city: null
      }),
    [referenceContent]
  );

  // event handlers
  const handleSelectReferenceVariant = useCallback(() => {
    if (isSelf) {
      onClick(null);
    } else {
      if (content) {
        onClick(content);
      } else {
        fetchContentPageReference(referenceContent.slug)
          .then(({ data: reference }) => {
            setContent(reference as ContentDocument);
            onClick(reference as ContentDocument);
          })
          .catch(() => {})
          .finally(() => {});
      }
    }
  }, [isSelf, content, referenceContent, onClick]);

  return (
    <div
      role="button"
      className={`relative flex h-full cursor-pointer flex-col items-center gap-2.5 overflow-hidden rounded-2xl border p-2.5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-3 sm:p-3 ${
        isSelected
          ? "border-moss bg-white shadow-sm ring-1 ring-moss/20 sm:bg-moss/5 sm:ring-0"
          : "border-zinc-100 bg-white hover:border-moss/20"
      }`}
      onClick={handleSelectReferenceVariant}
    >
      {/* CHECKBOX CIRCLE */}
      <div
        className={`absolute top-2 right-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 z-[1] sm:static sm:order-3 ${
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
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 sm:h-12 sm:w-12 sm:shrink-0 sm:bg-zinc-100">
        <NextImage
          alt={alt || defaultAlt || "Variant Image"}
          src={url}
          width={120}
          height={120}
          quality={100}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>

      {/* TEXT CONTAINER */}
      <div className="flex flex-col items-center gap-0.5 text-center sm:flex-1 sm:items-start sm:text-left">
        <span className="text-[12px] font-semibold text-zinc-600 line-clamp-1 capitalize sm:text-[13px] sm:text-zinc-700">
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

export default memo(ContentDetailReferenceVariant);
