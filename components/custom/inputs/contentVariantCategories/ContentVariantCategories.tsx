// libraries
import mongoose from "mongoose";

// icons
import { Plus } from "lucide-react";

// utils
import { getInitialVariantCategoryValue } from "./utils/getInitialVariantCategoryValue";
import { getInitialVariantCategoriesValue } from "./utils/getInitialVariantCategoriesValue";

// hooks
import { useEffect, useState } from "react";

// components
import VariantCategory from "./components/VariantCategory";

// types
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategory";
import { type ContentReferenceVariantDocument } from "@/common/types/documentation/nestedDocuments/contentReferenceVariant";
import { type ContentVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentVariantCategory";
import { FormSubTitle } from "../title/Form";

export default function ContentVariantCategories(
  props: {
    name: string;
    label?: string;
    performReset?: boolean;
    contentId: string;
    defaultValue?: ContentVariantCategoryDocument[];
  } & (
      | {
        isRequired?: undefined;
      }
      | {
        isRequired?: boolean;
        label: string;
      }
    ) &
    (
      | {
        value?: undefined;
        defaultValue?: ContentVariantCategoryDocument[];
      }
      | {
        value?: ContentVariantCategoryDocument[];
        defaultValue?: undefined;
        onChangeValue: (newValue: ContentVariantCategoryDocument[]) => void;
      }
    )
) {
  // props
  const {
    name,
    label,
    isRequired,
    performReset,
    contentId,
    defaultValue,
    value
  } = props;

  // states
  const [variantCategories, setVariantCategories] = useState<
    ContentVariantCategoryDocument[]
  >(defaultValue || value || getInitialVariantCategoriesValue());

  // variables
  const returnValue = variantCategories
    .filter(
      ({ type, label, reference, custom }) =>
        type &&
        label &&
        ((reference && reference.length > 1) ||
          (custom && custom.variants.length > 1))
    )
    .filter((variantCategory) =>
      variantCategory.type === "custom"
        ? variantCategory.label &&
          variantCategory.custom &&
          variantCategory.custom.variants.length > 1
          ? variantCategory.custom.options.unit
            ? variantCategory.custom.unit
            : true
          : false
        : variantCategory.label &&
        variantCategory.reference &&
        variantCategory.reference.length > 1
    )
    .map((variantCategory) => {
      let validVariantCategory = { ...variantCategory };

      if (!mongoose.Types.ObjectId.isValid(String(validVariantCategory._id))) {
        const { _id, ...rest } = validVariantCategory;
        validVariantCategory = rest as any;
      }

      if (validVariantCategory.type === "custom") {
        let validCustomVariantCategory = { ...validVariantCategory.custom };

        if (!mongoose.Types.ObjectId.isValid(String(validCustomVariantCategory._id))) {
          const { _id, ...rest } = validCustomVariantCategory;
          validCustomVariantCategory = rest as any;
        }

        if (validCustomVariantCategory.options?.image) {
          validCustomVariantCategory.variants = [
            ...(validCustomVariantCategory.variants as ContentCustomVariantDocument[])
          ].filter(({ image }) => image);
        } else {
          validCustomVariantCategory.variants = [
            ...(validCustomVariantCategory.variants as ContentCustomVariantDocument[])
          ].map((customVariant, i) => {
            if (i !== 0) {
              const { image, ...rest } = customVariant;
              return rest;
            }

            return customVariant;
          }) as ContentCustomVariantDocument[];
        }

        if (validCustomVariantCategory.options?.unit) {
          validCustomVariantCategory.variants = [
            ...(validCustomVariantCategory.variants as ContentCustomVariantDocument[])
          ]
            .filter(({ price, unit }) => price && unit)
            .map((customVariant) => {
              const { _id, label, value, ...rest } = customVariant;

              if (mongoose.Types.ObjectId.isValid(String(_id))) {
                return { ...rest, _id };
              }

              return rest;
            }) as ContentCustomVariantDocument[];
        } else {
          const { unit, ...restCustomCategory } = validCustomVariantCategory;
          validCustomVariantCategory = restCustomCategory as any;

          validCustomVariantCategory.variants = [
            ...(validCustomVariantCategory.variants as ContentCustomVariantDocument[])
          ]
            .filter(({ label, price }) => label && price)
            .map((customVariant) => {
              const { _id, value, unit, ...rest } = customVariant;

              if (mongoose.Types.ObjectId.isValid(String(_id))) {
                return { ...rest, _id };
              }

              return rest;
            }) as ContentCustomVariantDocument[];
        }

        validVariantCategory.custom =
          validCustomVariantCategory as ContentCustomVariantCategoryDocument;

        const { reference, ...restVariantCategory } = validVariantCategory;
        validVariantCategory = restVariantCategory as any;
      }

      if (validVariantCategory.type === "reference") {
        const validReferenceVariants = [
          ...(validVariantCategory.reference as ContentReferenceVariantDocument[])
        ]
          .filter(({ label, reference }) => label && reference)
          .map((referenceVariant) => {
            const { _id, ...rest } = referenceVariant;

            if (mongoose.Types.ObjectId.isValid(String(_id))) {
              return referenceVariant;
            }

            return rest;
          });

        validVariantCategory.reference =
          validReferenceVariants as ContentReferenceVariantDocument[];

        const { custom, ...restVariantCategory } = validVariantCategory;
        validVariantCategory = restVariantCategory as any;
      }

      return validVariantCategory;
    })
    .filter((variantCategory: any) =>
      (variantCategory.reference && variantCategory.reference.length > 1) ||
      (variantCategory.custom && variantCategory.custom.variants.length > 1)
    );

  // handlers
  const handleAddVariantCategory = () => {
    setVariantCategories([
      ...variantCategories,
      getInitialVariantCategoryValue()
    ]);
  };

  const handleDeleteVariantCategory = (variantCategoryId: string) => {
    if (variantCategories.length === 1) {
      setVariantCategories(getInitialVariantCategoriesValue());
    } else {
      setVariantCategories(
        [...variantCategories].filter(({ _id }) => String(_id) !== String(variantCategoryId))
      );
    }
  };

  // effects
  useEffect(() => {
    if (defaultValue) {
      setVariantCategories(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if ("onChangeValue" in props) {
      props.onChangeValue(returnValue as ContentVariantCategoryDocument[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantCategories]);

  return (
    <>
      {label && (
        <FormSubTitle subtitle={label} />
      )}
      <section className="flex flex-col gap-5">
        {variantCategories.map((variantCategory, i) => (
          <VariantCategory
            key={i}
            index={i}
            contentId={contentId}
            variantCategory={variantCategory}
            onChangeVariantCategory={(newVariantCategory) => {
              setVariantCategories(
                [...variantCategories].map((variantCategory) =>
                  String(variantCategory._id) === String(newVariantCategory._id)
                    ? newVariantCategory
                    : variantCategory
                )
              );
            }}
            onDeleteVariantCategory={() => {
              handleDeleteVariantCategory(String(variantCategory._id));
            }}
          />
        ))}

        <div
          onClick={handleAddVariantCategory}
          className="rounded-lg py-2 text-teal-600 w-full flex items-center justify-center col-span-4 cursor-pointer gap-1.5 transition-all duration-300 bg-teal-200 hover:bg-teal-600 hover:text-white border border-teal-400 hover:border-teal-600"
        >
          <Plus
            strokeWidth={1.5}
            width={20}
            height={20}
          />
          <span>Add</span>
        </div>
      </section>
      <input
        className="hidden"
        type="text"
        name={name}
        value={returnValue.length ? JSON.stringify(returnValue) : ""}
        onChange={() => { }}
      />
    </>
  );
}
