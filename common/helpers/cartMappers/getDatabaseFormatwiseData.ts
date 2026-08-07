import { AddonDocument } from "@/common/types/documentation/contents/addon";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { CouponDocument } from "@/common/types/documentation/contents/coupon";
import { CartDocument } from "@/common/types/documentation/dynamic/cart";
import { CustomizationImageDocument } from "@/common/types/documentation/media/customizationImage";
import { CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";
import { CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { CartItemCustomizationDocument } from "@/common/types/documentation/nestedDocuments/cartItemCustomization";
import { TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";
import { DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { EnhancementDocument } from "@/common/types/documentation/presets/enhancement";
import { FlavourDocument } from "@/common/types/documentation/presets/flavour";
import { OccasionDocument } from "@/common/types/documentation/presets/occasion";
import { UpgradeDocument } from "@/common/types/documentation/presets/upgrade";
import { VenueDocument } from "@/common/types/documentation/presets/venue";
import { updateMasterCartPrices } from "./manageCartContext";

type AnyObject = Record<string, any>;

export function removeLocalIds(obj: AnyObject): AnyObject {
  // Create a new object to hold the modified properties
  const result: AnyObject = {};

  for (const key in obj) {
    if (key === "_id" && obj[key].length === 20) {
      // Skip this key if it's "_id"
      continue;
    }

    const value = obj[key];

    // Recursively process nested objects or arrays
    if (typeof value === "object" && value !== null) {
      result[key] = Array.isArray(value)
        ? value.map(removeLocalIds)
        : removeLocalIds(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function excludePartialCheckout(cartDoc: CartDocument): CartDocument {
  const checkout = cartDoc.checkout;
  if (
    checkout &&
    checkout.name &&
    checkout.name.length &&
    checkout.location.address &&
    checkout.location.address.length &&
    checkout.location.pincode &&
    checkout.location.pincode.length &&
    checkout.contact.mail &&
    checkout.contact.mail.length &&
    checkout.contact.mobileNumber &&
    checkout.contact.mobileNumber.length
  )
    return cartDoc;

  const { checkout: _, ...duplicated } = cartDoc;

  return duplicated as CartDocument;
}

export function getDatabaseReadyCartDocument(cart: CartDocument): CartDocument {
  let readyCart = cart;

  // items
  let updatedItems = cart.items.map((item) => {
    let updatedItem = {
      ...item,
      content: String((item.content as ContentDocument)._id),
      delivery: {
        ...item.delivery,
        type: String((item.delivery.type as DeliveryTypeDocument)._id),
        slot:
          typeof item.delivery.slot === "string"
            ? item.delivery.slot
            : String((item.delivery.slot as TimeSlotDocument)._id),
        date: item.delivery.date
      }
    } as CartItemDocument;

    const updatedAddons = item.addons
      ? item.addons.map(
        (adn) =>
          ({
            ...adn,
            addon: String((adn.addon as AddonDocument)._id)
          }) as CartItemAddonDocument
      )
      : undefined;

    const updatedCustomization = item.customization
      ? ({
        ...item.customization,
        flavour: item.customization.flavour
          ? {
            ...item.customization.flavour,
            flavour: String(
              (item.customization.flavour.flavour as FlavourDocument)._id
            )
          }
          : undefined,
        upgrade: item.customization.upgrade
          ? {
            ...item.customization.upgrade,
            flavour: String(
              (item.customization.upgrade.upgrade as UpgradeDocument)._id
            )
          }
          : undefined,
        uploadedImage: item.customization.uploadedImage
          ? {
            ...item.customization.uploadedImage,
            images: (
              item.customization.uploadedImage
                .images as CustomizationImageDocument[]
            ).map(({ _id }) => String(_id))
          }
          : undefined,
        enhancement: item.customization.enhancement
          ? {
            ...item.customization.enhancement,
            items: item.customization.enhancement.items.map(
              ({ price, enhancement }) => ({
                price,
                enhancement: String(
                  (enhancement as EnhancementDocument)._id
                )
              })
            )
          }
          : undefined
      } as CartItemCustomizationDocument)
      : undefined;

    if (updatedAddons)
      updatedItem = {
        ...updatedItem,
        addons: updatedAddons
      } as CartItemDocument;

    if (updatedCustomization)
      updatedItem = {
        ...updatedItem,
        customization: updatedCustomization
      } as CartItemDocument;

    return updatedItem;
  });

  // coupon
  let updatedCoupon = cart.coupon
    ? String((cart.coupon as CouponDocument)._id)
    : undefined;

  // checkout
  let updatedCheckout = cart.checkout
    ? ({
      ...cart.checkout,
      occasion: cart.checkout.occasion
        ? String((cart.checkout.occasion as OccasionDocument)._id)
        : undefined,
      venue: cart.checkout.venue
        ? String((cart.checkout.venue as VenueDocument)._id)
        : undefined
    } as CartCheckoutDocument)
    : undefined;

  return {
    ...readyCart,
    coupon: updatedCoupon,
    items: updatedItems,
    checkout: updatedCheckout
  } as CartDocument;
}

export const updateCartPrices = (cart: CartDocument): CartDocument => {
  const updatedPrices = updateMasterCartPrices({ cart });
  if (updatedPrices) return { ...cart, price: updatedPrices } as CartDocument;
  return cart;
};
