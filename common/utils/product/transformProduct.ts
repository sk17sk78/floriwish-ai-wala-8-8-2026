// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentListItemDataDocument } from "@/common/types/documentation/nestedDocuments/contentListItemData";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { getChromaticAberrationColor } from "@/components/(frontend)/category/utils/getChromaticAberrationColor";

export const transformProductToListItem = (item: any): ContentDocument => {
  const promotionTag = item.tag?.promotionTag;

  const listItemData: ContentListItemDataDocument = {
    name: item.name,
    slug: `${item.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${item.slug}`,
    image: {
      alt:
        item.media?.primary?.alt ||
        item.media?.primary?.defaultAlt ||
        item.name,
      url: item.media?.primary?.url || ""
    },
    price: item.price?.price || 0,
    discount: item.price?.mrp
      ? Math.round(
          ((item.price.mrp - item.price.price) / item.price.mrp) * 100
        )
      : 0,
    ratingValue: item.quality?.rating?.value,
    ratingCount: item.quality?.rating?.count,
    processingTime: item.delivery?.processingTime?.hours || 0,
    lastDeliverySlot: ((): string => {
      let maxStartTime = "";
      const slots = item.delivery?.slots;

      if (slots && Array.isArray(slots)) {
        slots.forEach((slot: any) => {
          const deliveryType = slot.type;
          const timeSlotIds = slot.timeSlots;

          if (
            deliveryType &&
            Array.isArray(deliveryType.timeSlots) &&
            Array.isArray(timeSlotIds)
          ) {
            deliveryType.timeSlots
              .filter((ts: any) => timeSlotIds.includes(ts._id))
              .forEach((ts: any) => {
                const startTime = ts.startTime;
                if (!maxStartTime) {
                  maxStartTime = startTime;
                } else {
                  const [hours, minutes] = maxStartTime.split(":").map(Number);
                  const [newHours, newMinutes] = startTime.split(":").map(Number);

                  if (
                    newHours > hours ||
                    (newHours === hours && newMinutes > minutes)
                  ) {
                    maxStartTime = startTime;
                  }
                }
              });
          }
        });
      }
      return maxStartTime;
    })(),
    edible:
      item.edible?.isEdible && item.edible.type !== "unspecified"
        ? item.edible.type
        : undefined,
    ...(promotionTag
      ? {
          tag: {
            label: promotionTag.name,
            backgroundColor: promotionTag.color?.hexCode || "",
            textColor: getChromaticAberrationColor(
              promotionTag.color?.hexCode || ""
            )
          }
        }
      : {}),
    createdDate: item.updatedAt || item.createdAt
  } as ContentListItemDataDocument;

  return {
    _id: item._id,
    _listItemData: listItemData,
    // Keep raw price if needed for city-based updates
    price: {
      base: {
        price: item.price?.price || 0,
        mrp: item.price?.mrp || 0
      },
      cities: [] // This will be handled by the city update effect
    }
  } as any;
};
