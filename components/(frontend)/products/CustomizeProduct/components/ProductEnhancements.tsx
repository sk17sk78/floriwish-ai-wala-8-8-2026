import { useState } from "react";
import { SetStateType } from "@/common/types/reactTypes";
import { SquareCheckBigIcon, SquareIcon } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";
import NextImage from "@/components/custom/NextImage";
import { ContentEnhancementItemDocument } from "@/common/types/documentation/nestedDocuments/contentEnhancementItem";
import { EnhancementDocument } from "@/common/types/documentation/presets/enhancement";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { OPTIMIZE_IMAGE } from "@/config/image";

export default function ProductEnhancements({
  enhancements,
  setEnhancements,
  availableEnhancements
}: {
  enhancements: Array<ContentEnhancementItemDocument>;
  setEnhancements: SetStateType<Array<ContentEnhancementItemDocument>>;
  availableEnhancements: Array<ContentEnhancementItemDocument>;
}) {
  const updateSelectedEnhancements = (newEnhancementId: string) => {
    const isSelected = enhancements.find(({ _id }) => String(_id) === String(newEnhancementId));

    if (isSelected) {
      // remove the selected enhancement
      setEnhancements((prev) =>
        prev.filter(({ _id }) => String(_id) !== String(newEnhancementId))
      );
    } else {
      const newEnhancement = availableEnhancements.find(
        ({ _id }) => String(_id) === String(newEnhancementId)
      );

      if (newEnhancement)
        // add the selected enhancement
        setEnhancements((prev) => [...prev, newEnhancement]);
    }
  };

  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {availableEnhancements &&
          availableEnhancements.length &&
          availableEnhancements
            .slice(0, showAll ? availableEnhancements.length : 3)
            .map(({ enhancement, price, _id }, index) => {
              const isSelected = !!enhancements.find(({ _id: id }) => String(_id) === String(id));
              return (
                <div
                  key={index}
                  role="button"
                  className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
                    isSelected
                      ? "border-moss bg-moss/5 shadow-sm"
                      : "border-zinc-100 bg-white hover:border-moss/20 hover:shadow-sm"
                  }`}
                  onClick={() => updateSelectedEnhancements(String(_id))}
                >
                  {/* IMAGE CONTAINER */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <NextImage
                      src={
                        ((enhancement as EnhancementDocument).image as ImageDocument)
                          .url
                      }
                      alt={
                        ((enhancement as EnhancementDocument).image as ImageDocument)
                          .alt || "Enhancement Image"
                      }
                      height={120}
                      width={120}
                      draggable={false}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* TEXT CONTAINER */}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-zinc-700">
                      {(enhancement as EnhancementDocument).label}
                    </span>
                    <span className="text-[13px] font-bold text-zinc-900">
                      {INRSymbol} {price}
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
      {availableEnhancements && availableEnhancements.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-moss hover:underline w-fit transition-all duration-200"
        >
          {showAll ? "Show Less" : `+${availableEnhancements.length - 3} more options`}
        </button>
      )}
    </div>
  );
}
