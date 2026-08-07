// utils
import { getCustomVariant } from "./getCustomVariant";
import { isDateExpired } from "@/app/api/frontend/cart/utils/isDateExpired";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type ContentDocument } from "@/common/types/documentation/contents/content";

export const validateCartItems = ({
  selectedCity,
  items
}: {
  selectedCity: CityDocument | null;
  items: CartItemDocument[];
}): CartItemDocument[] => {
  

  const validDateCartItems = items.filter(
    ({ delivery }) => !isDateExpired(delivery?.date || "")
  );

  

  const validUniqueCartItems = items.filter(
    ({ content }, index) =>
      content && validDateCartItems.indexOf(
        validDateCartItems.find(
          ({ content: content2 }) =>
            content2 && String((content as ContentDocument)._id) === String((content2 as ContentDocument)._id)
        ) as CartItemDocument
      ) === index
  );

  const priceUpdatedItems = [...validUniqueCartItems].map((item) => {
    const updatedItem = { ...item };
    try {
      if (!item || !item.content) return updatedItem as CartItemDocument;
      const content = item.content as ContentDocument;
      
      const customVariant = item.customVariant
        ? getCustomVariant({ content, variantId: item.customVariant })
        : null;
        
      const basePrice = customVariant
        ? customVariant?.price?.base?.price || 0
        : content?.price?.base?.price || 0;
        
      const cityPrice = customVariant
        ? customVariant?.price?.cities?.find(
            ({ city }) => String(city) === String(selectedCity?._id)
          )?.price
        : content?.price?.cities?.find(({ city }) => String(city) === String(selectedCity?._id))?.price;

      updatedItem.pricePerUnit = cityPrice || basePrice || 0;
    } catch (error) {
      console.error("Error validating cart item price", error);
      updatedItem.pricePerUnit = 0;
    }

    return updatedItem as CartItemDocument;
  });

  

  return priceUpdatedItems;
};
