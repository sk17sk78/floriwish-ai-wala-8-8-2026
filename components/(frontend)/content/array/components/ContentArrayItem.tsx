// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// icons
import { INRSymbol } from "@/common/constants/symbols";
import {
  NonVegSymbol,
  VegSymbol
} from "@/components/(_common)/Symbols/Edibles";
import { Loader2, Star, StarHalf, StarIcon, Zap } from "lucide-react";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { getContentPrice } from "../../utils/getContentPrice";
import { getEarliestDelivery } from "../utils/getEarliestDelivery";
import { getPromotionSticker } from "../utils/getPromotionSticker";

import { normalizeRating } from "@/common/helpers/normalizeRating";
import { getRatingValue } from "../../utils/getRatingValue";

// hooks
import { useMemo } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import Link from "next/link";
import ShineAnimation from "./ShineAnimation";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";
import CategoryContent from "@/components/(frontend)/category/components/CategoryContent";
import CategoryContentImage from "@/components/(frontend)/category/components/CategoryContentImage";
import CategoryContentTag from "@/components/(frontend)/category/components/CategoryContentTag";
import { ContentListItemDataTagDocument } from "@/common/types/documentation/nestedDocuments/contentListItemDataTag";
import CategoryContentName from "@/components/(frontend)/category/components/CategoryContentName";
import CategoryContentPrice from "@/components/(frontend)/category/components/CategoryContentPrice";
import CategoryContentDiscount from "@/components/(frontend)/category/components/CategoryContentDiscount";
import CategoryContentEarliestDelivery from "@/components/(frontend)/category/components/CategoryContentEarliestDelivery";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";
import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";

function ContentArrayItem({
  index,
  isScrollable,
  content
}: {
  index: number;
  isScrollable?: boolean;
  content: ContentDocument;
}) {
  // hooks
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();

  // variables
  const {
    type,
    name,
    slug,
    media: { primary }
  } = useMemo(() => content, [content]);

  const { alt, defaultAlt, url } = useMemo(
    () => primary as ImageDocument,
    [primary]
  );

  const { mrp, price } = useMemo(
    () =>
      getContentPrice({
        city: selectedCity,
        price: content.price as ContentPriceDocument
      }),
    [content, selectedCity]
  );

  const edibleType = useMemo(
    () => (content?.edible as EdibleDocument)?.type,
    [content]
  );
  const processingTime = useMemo(
    () =>
      ((content?.delivery as ContentDeliveryDocument)?.processingTime as ProcessingTimeDocument)
        ?.hours || 0,
    [content]
  );

  const slots = useMemo(
    () =>
      (content?.delivery as ContentDeliveryDocument)
        ?.slots as ContentDeliverySlotDocument[],
    [content]
  );

  const sticker = useMemo(
    () =>
      content?.tag?.promotionTag
        ? getPromotionSticker({
          promotionTag: content.tag.promotionTag as PromotionTagDocument
        })
        : undefined,
    [content]
  );

  const rating = useMemo(() => content?.quality?.rating, [content]);
  const ratingValue = useMemo(() => rating?.value ?? (content as any)?.ratingValue, [rating, content]);
  const ratingCount = useMemo(() => rating?.count ?? (content as any)?.ratingCount, [rating, content]);

  return (
    <Link
      href={`${type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${slug}`}
      prefetch={false}
      className={`group grid *:row-start-1 *:col-start-1 min-w-0 sm:min-w-[calc(33.33%-1rem)] md:min-w-[calc(25%-1rem)] lg:min-w-[calc(20%-1rem)] rounded-none h-fit min-h-fit snap-start`}
    >
      <div
        className={`relative shadow-md z-20 transition-all duration-300 rounded-xl bg-ivory-1 ${index > 1 ? "max-sm:border-t-[0.5px]" : ""}  ${index % 2 === 0 ? "" : ""} ${index % 2 === 0 ? "" : "max-sm:border-l-[0.5px]"} border-ash/25`}
      >
        <div
          className={`relative  aspect-square rounded-none rounded-b-none sm:rounded-b-none sm:rounded-xl overflow-hidden`}
        >
          <CategoryContentImage
            index={index}
            alt={alt}
            url={url}
          />
          {/* <CategoryContentEdible edible={edible} /> */}
          {/* <CategoryContentRating
            ratingValue={ratingValue}
            ratingCount={ratingCount}
          /> */}
          {sticker && (
            <CategoryContentTag
              tag={{
                backgroundColor: sticker.bgColor,
                textColor: sticker.textColor,
                label: sticker.label
              } as ContentListItemDataTagDocument}
            />
          )}
          <ShineAnimation />
        </div>
        <div
          className={`relative pt-3 flex flex-col gap-y-1 rounded-sm sm:rounded-xl rounded-t-none sm:rounded-t-none overflow-hidden bg-ivory-1 mt-0 sm:border-[1.5px] sm:border-ash/40 border-t-0 rounded-b-xl`}
        >
          <CategoryContentEarliestDelivery
            processingTime={processingTime}
            slots={slots}
          />
          <CategoryContentName
            name={name}
            edible={undefined}
          />
          <div
            className={`px-2 sm:px-3.5 relative flex items-baseline justify-start gap-2 w-full z-20`}
          >
            <CategoryContentPrice price={price} />
            {mrp && price && Math.ceil((1 - price / mrp) * 100) > 0 && (
              <CategoryContentDiscount discount={Math.ceil((1 - price / mrp) * 100)} />
            )}
          </div>
          {(ratingValue || ratingCount) && (
            <div className="flex text-charcoal-3/70 px-2 text-[9px] sm:text-sm font-medium sm:px-3.5 pb-3 items-center justify-start gap-x-1">
              <div className="flex items-center gap-[1px]">
                {Array.from({ length: 5 }).map((_, i) => {
                  const normalizedVal = normalizeRating(ratingValue || 0) || 5;
                  if (i + 1 <= Math.floor(normalizedVal)) {
                    return (
                      <Star
                        key={i}
                        className="fill-amber-500 text-amber-500"
                        width={10}
                        height={10}
                      />
                    );
                  } else if (i + 0.5 <= normalizedVal) {
                    return (
                      <StarHalf
                        key={i}
                        className="fill-amber-500 text-amber-500"
                        width={10}
                        height={10}
                      />
                    );
                  } else {
                    return (
                      <Star
                        key={i}
                        className="text-amber-500"
                        width={10}
                        height={10}
                      />
                    );
                  }
                })}
              </div>
              <span>{getRatingValue(ratingValue || 0)}</span>
              <span className="whitespace-nowrap">({ratingCount || 0} reviews)</span>
            </div>
          )}
        </div>
      </div>
    </Link>



  );
}

export default ContentArrayItem;
