
// config
import { OPTIMIZE_IMAGE } from "@/config/image";

import { ContentVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentVariantCategory";
import { CardTitle } from "../shared/ProductMiscUI";
import { LabelDocument } from "@/common/types/documentation/presets/label";
import NextImage from "@/components/custom/NextImage";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { INRSymbol } from "@/common/constants/symbols";
import { ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { useEffect, useState } from "react";
import { ContentCustomVariantCategoryOptionDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategoryOption";
import { UnitDocument } from "@/common/types/documentation/presets/unit";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { SERVING_INFO } from "../../static/data";
import { UnitServeDocument } from "@/common/types/documentation/nestedDocuments/unitServe";
import { Check } from "lucide-react";
import { getCityWisePrices } from "@/common/helpers/getCityWiseContentPrices";
// import { useLocation } from "@/hooks/useLocation/useLocation";
import { CityDocument } from "@/common/types/documentation/presets/city";

export default function CustomVariant({
  data,
  selectedId,
  selectedCity,
  onSelect
}: {
  data: ContentVariantCategoryDocument;
  selectedId?: string;
  selectedCity: CityDocument | null;
  onSelect: (selectedId: string | undefined) => void;
}) {
  // const { selectedCity } = useLocation();

  const hasImages =
    data.reference && data.reference.length > 0
      ? true
      : data.custom && data.custom.options.image
        ? true
        : false;

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
        {data.type === "custom" &&
          data.custom &&
          data.custom.variants.length > 0 &&
          data.custom.variants.map(
            ({ label, price, image, value, _id }, index) => {
              const { price: variantPrice } = getCityWisePrices({
                city: selectedCity,
                prices: price
              });
              const isSelected = String(selectedId) === String(_id);
              return (
                <div
                  key={index}
                  role="button"
                  className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border p-3 transition-all duration-200 ${
                    isSelected
                      ? "border-moss bg-moss/5 shadow-sm"
                      : "border-zinc-100 bg-white hover:border-moss/20 hover:shadow-sm"
                  }`}
                  onClick={() => onSelect(String(_id))}
                >
                  {/* IMAGE CONTAINER */}
                  {hasImages ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      <NextImage
                        alt={
                          (image as ImageDocument).alt ||
                          (image as ImageDocument).defaultAlt ||
                          "Variant Image"
                        }
                        src={(image as ImageDocument).url}
                        priority
                        width={120}
                        height={120}
                        draggable={false}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <></>
                  )}

                  {/* TEXT CONTAINER */}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-zinc-700">
                      {(data.custom &&
                      (
                        data.custom
                          .options as ContentCustomVariantCategoryOptionDocument
                      ).unit
                        ? `${value} ${(data.custom.unit as UnitDocument).abbr || ""}`
                        : label) || ""}
                    </span>
                    <span className="text-[13px] font-bold text-zinc-900">
                      {INRSymbol} {variantPrice}
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
            }
          )}
      </div>

      {/* {data.custom &&
      data.custom.unit &&
      (data.custom.unit as UnitDocument).serves &&
      ((data.custom.unit as UnitDocument).serves as UnitServeDocument[])
        .length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <div className="absolute top-5 right-6 rounded-full transition-all duration-300 cursor-pointer font-medium aspect-square w-7 h-7 grid place-items-center bg-sienna-3/30 text-sienna hover:bg-sienna-3/80">
              ?
            </div>
          </PopoverTrigger>
          <PopoverContent className="grid grid-cols-[2fr_3fr] max-w-[260px] p-4 shadow-md rounded-2xl bg-[#dacb8d] outline-none border-none">
            <div className="col-span-2 font-medium text-center rounded-t-xl pb-3 pt-0.5 text-lg text-[#2c2402]">
              Serving Info
            </div>
            {(data.custom.unit as UnitDocument).serves?.map(
              ({ minPerson, maxPerson, value }, index) => (
                <>
                  <div
                    className={`bg-ivory-1 py-3.5 px-4 ${index === 0 ? "rounded-tl-2xl" : index === SERVING_INFO.length - 1 ? "rounded-bl-2xl" : ""} ${index === SERVING_INFO.length - 1 ? "" : "border-b border-charcoal-3/15"}`}
                    key={index}
                  >
                    {value} {(data.custom?.unit as UnitDocument).abbr || ""}
                  </div>
                  <div
                    className={`bg-ivory-1 py-3.5 px-4 ${index === 0 ? "rounded-tr-2xl" : index === SERVING_INFO.length - 1 ? "rounded-br-2xl" : ""} ${index === SERVING_INFO.length - 1 ? "" : "border-b border-charcoal-3/15"}`}
                    key={index}
                  >
                    {minPerson} - {maxPerson} people
                  </div>
                </>
              )
            )}
          </PopoverContent>
        </Popover>
      ) : (
        <></>
      )} */}
    </div>
  );
}

/* 




{showServingInfo && (
             
            )}
*/
