// icons
import { X } from "lucide-react";

// components
import ContentPriceDialog from "./ContentPriceDialog";
import Input from "@/lib/Forms/Input/Input";
import SelectImage from "../../image/SelectImage";

// types
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryOptionDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategoryOption";

export default function CustomVariant({
  disabled,
  customOptions,
  customVariant,
  unit,
  unitOptions,
  onChangeUnit,
  onChangeCustomVariant,
  onDeleteCustomVariant
}: {
  disabled?: boolean;
  customOptions: ContentCustomVariantCategoryOptionDocument;
  customVariant: ContentCustomVariantDocument;
  unit: string;
  unitOptions: { label: string; value: string }[];
  onChangeUnit: (unit: string) => void;
  onChangeCustomVariant: (
    newCustomVariant: ContentCustomVariantDocument
  ) => void;
  onDeleteCustomVariant: () => void;
}) {
  return (
    <section className="relative flex flex-col rounded-2xl gap-3 bg-neutral-100 border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      {!disabled && (
        <div
          onClick={onDeleteCustomVariant}
          className="rounded-full absolute -top-1.5 -right-1.5 bg-red-600 text-white p-1 z-10 cursor-pointer transition-all duration-300 hover:bg-red-700"
        >
          <X
            strokeWidth={1.5}
            width={16}
            height={16}
          />
        </div>
      )}
      {customOptions.image && (
        <SelectImage
          name="image"
          label=""
          disabled={disabled}
          value={customVariant.image as string}
          onChangeValue={(image) => {
            onChangeCustomVariant({
              ...customVariant,
              image
            } as ContentCustomVariantDocument);
          }}
        />
      )}
      {!customOptions.unit && (
        <Input
          type="text"
          name="label"
          placeholder="Label"
          isRequired={false}
          errorCheck={false}
          validCheck={false}
          labelConfig={{
            label: "Label",
            labelStyle: "text-sm font-semibold text-neutral-700",
            layoutStyle: "flex flex-col gap-1 w-full"
          }}
          customValue={{
            value: customVariant?.label || "",
            setValue: (label) => {
              onChangeCustomVariant({
                ...customVariant,
                label
              } as ContentCustomVariantDocument);
            }
          }}
        />
      )}
      {customOptions.unit && (
        <>
          <datalist id={`unit-options-${customVariant._id}`}>
            {unitOptions.map(({ label }, index) => (
              <option key={index} value={label} />
            ))}
          </datalist>
          <Input
            type="text"
            name="unit"
            placeholder="Unit (e.g. 1 Pound)"
            isRequired={true}
            errorCheck={false}
            validCheck={false}
            labelConfig={{
              label: "Unit",
              labelStyle: "text-sm font-semibold text-neutral-700",
              layoutStyle: "flex flex-col gap-1 w-full"
            }}
            list={`unit-options-${customVariant._id}`}
            customValue={{
              value: (customVariant?.unit as string) || unit || "",
              setValue: (newUnit) => {
                onChangeCustomVariant({
                  ...customVariant,
                  unit: newUnit
                } as ContentCustomVariantDocument);
              }
            }}
          />
        </>
      )}
      <ContentPriceDialog
        disabled={disabled}
        price={customVariant.price}
        onChangePrice={(price) => {
          onChangeCustomVariant({
            ...customVariant,
            price
          } as ContentCustomVariantDocument);
        }}
      />
    </section>
  );
}
