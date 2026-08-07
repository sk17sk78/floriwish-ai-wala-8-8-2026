// libraries
import { Types } from "mongoose";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { type CartItemCustomizationDocument } from "@/common/types/documentation/nestedDocuments/cartItemCustomization";
import { type CartItemDeliveryDocument } from "@/common/types/documentation/nestedDocuments/cartItemDelivery";
import { type ContentDocument } from "@/common/types/documentation/contents/content";

export const getCartItem = ({
  content,
  customVariant,
  titleIfCustomVariant,
  pricePerUnit,
  delivery,
  customization,
  addons
}: {
  content: ContentDocument;
  customVariant?: string;
  titleIfCustomVariant?: string;
  pricePerUnit: number;
  delivery: CartItemDeliveryDocument;
  customization: CartItemCustomizationDocument;
  addons: CartItemAddonDocument[];
}) =>
  ({
    _id: new Types.ObjectId(),
    status: "new",
    content,
    customVariant,
    titleIfCustomVariant,
    pricePerUnit,
    quantity: 1,
    delivery,
    customization,
    addons
  }) as CartItemDocument;
