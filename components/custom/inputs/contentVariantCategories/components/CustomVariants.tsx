// icons
import { Plus } from "lucide-react";

// utils
import { getInitialCustomVariantValue } from "../utils/getInitialCustomVariantValue";
import { getInitialCustomVariantsValue } from "../utils/getInitialCustomVariantsValue";

// components
import CustomVariant from "./CustomVariant";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryOptionDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategoryOption";

export default function CustomVariants({
  content,
  customOptions,
  customVariants,
  unit,
  unitOptions,
  onChangeUnit,
  onChangeCustomVariants
}: {
  content: ContentDocument;
  customOptions: ContentCustomVariantCategoryOptionDocument;
  customVariants: ContentCustomVariantDocument[];
  unit: string;
  unitOptions: { label: string; value: string }[];
  onChangeUnit: (unit: string) => void;
  onChangeCustomVariants: (
    newCustomVariants: ContentCustomVariantDocument[]
  ) => void;
}) {
  // handlers
  const handleAddCustomVariant = () => {
    onChangeCustomVariants([
      ...customVariants,
      getInitialCustomVariantValue({ image: content.media.primary })
    ]);
  };

  const handleDeleteReferenceVariant = (customVariantId: string) => {
    if (customVariants.length === 2) {
      onChangeCustomVariants(getInitialCustomVariantsValue({ content }));
    } else {
      onChangeCustomVariants(
        [...customVariants].filter(({ _id }) => String(_id) !== String(customVariantId))
      );
    }
  };

  return (
    <section className="flex flex-col gap-2 p-2 w-full">
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
        {customVariants.map((customVariant, i) => (
          <CustomVariant
            key={i}
            disabled={i === 0}
            customOptions={customOptions}
            customVariant={customVariant}
            unit={unit}
            unitOptions={unitOptions}
            onChangeUnit={onChangeUnit}
            onChangeCustomVariant={(newCustomVariant) => {
              onChangeCustomVariants(
                [...customVariants].map((variant) =>
                  String(variant._id) === String(newCustomVariant._id)
                    ? newCustomVariant
                    : variant
                )
              );
            }}
            onDeleteCustomVariant={() => {
              handleDeleteReferenceVariant(String(customVariant._id));
            }}
          />
        ))}
      </section>
      <div className="flex items-center justify-end w-full mt-4">
        <div
          onClick={handleAddCustomVariant}
          className="rounded-xl p-3 text-rose-600 flex items-center justify-center cursor-pointer gap-2 transition-all duration-300 bg-rose-100 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 shadow-sm"
        >
          <Plus
            strokeWidth={2}
            width={20}
            height={20}
          />
          <span className="font-medium">Add Variant</span>
        </div>
      </div>
    </section>
  );
}
