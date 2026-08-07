import { ContentVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentVariantCategory";
import { CardTitle } from "../shared/ProductMiscUI";
import { LabelDocument } from "@/common/types/documentation/presets/label";
import { INRSymbol } from "@/common/constants/symbols";
import { ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import NextImage from "@/components/custom/NextImage";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { Check } from "lucide-react";
import { OPTIMIZE_IMAGE } from "@/config/image";

export default function ReferenceVariant({
  data,
  selectedId,
  onSelect
}: {
  data: ContentVariantCategoryDocument;
  selectedId?: string;
  onSelect: (selectedId: string | undefined) => void;
}) {
  return (
    <div className="bg-ivory-1 relative shadow-light sm:rounded-3xl pt-5 pb-5 border-y sm:border border-ash/40 px-4 sm:px-6 sm:max-w-[calc(470px_+_24px)]">
      <CardTitle
        str={
          ((data.label as LabelDocument).label || "").toLowerCase().includes("coust")
            ? "Add More to Celebration"
            : (data.label as LabelDocument).label || ""
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4">
        {data.reference &&
          data.reference.length > 0 &&
          data.reference.map(({ label, reference, _id }, index) => {
            const isSelected =
              String(selectedId) === String((reference as ContentDocument)._id);
            return (
              <div
                key={index}
                role="button"
                className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
                  isSelected
                    ? "border-moss bg-moss/5 shadow-sm"
                    : "border-zinc-100 bg-white hover:border-moss/20 hover:shadow-sm"
                }`}
                onClick={() =>
                  onSelect(String((reference as ContentDocument)?._id))
                }
              >
                {/* IMAGE CONTAINER */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  <NextImage
                    alt={
                      ((reference as ContentDocument).media?.primary as ImageDocument)
                        ?.alt ||
                      ((reference as ContentDocument).media?.primary as ImageDocument)
                        ?.defaultAlt ||
                      "Variant Image"
                    }
                    src={
                      ((reference as ContentDocument).media?.primary as ImageDocument)
                        ?.url || ""
                    }
                    priority
                    width={120}
                    height={120}
                    draggable={false}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* TEXT CONTAINER */}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-zinc-700">
                    {label || ""}
                  </span>
                  <span className="text-[13px] font-bold text-zinc-900">
                    {INRSymbol}
                    {
                      ((reference as ContentDocument).price as ContentPriceDocument)
                        .base.price
                    }
                  </span>
                </div>

                {/* CHECKBOX CIRCLE */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-moss bg-moss text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
