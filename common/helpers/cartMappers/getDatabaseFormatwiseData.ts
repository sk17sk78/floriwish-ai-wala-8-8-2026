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
  if (!checkout) return cartDoc;

  // Check if at least one field has data
  const hasData =
    Boolean(checkout.name?.trim()) ||
    Boolean(checkout.contact?.mobileNumber?.trim()) ||
    Boolean(checkout.contact?.mail?.trim()) ||
    Boolean(checkout.location?.address?.trim()) ||
    Boolean(checkout.location?.city?.trim()) ||
    Boolean(checkout.location?.pincode?.trim()) ||
    Boolean(checkout.receiverName?.trim()) ||
    Boolean(checkout.occasion);

  if (hasData) {
    return {
      ...cartDoc,
      checkout: {
        ...checkout,
        name: checkout.name || "",
        contact: {
          mobileNumber: checkout.contact?.mobileNumber || "",
          mail: checkout.contact?.mail || "",
          alternateMobileNumber: checkout.contact?.alternateMobileNumber || ""
        },
        location: {
          address: checkout.location?.address || "",
          city: checkout.location?.city || "",
          pincode: checkout.location?.pincode || "",
          landmark: checkout.location?.landmark || ""
        }
      }
    } as CartDocument;
  }

  const { checkout: _, ...duplicated } = cartDoc;
  return duplicated as CartDocument;
}

export function getDatabaseReadyCartDocument(cart: CartDocument): CartDocument {
  let readyCart = cart;

  // items
  let updatedItems = (cart.items || []).map((item) => {
    const contentId =
      typeof item.content === "string"
        ? item.content
        : (item.content as ContentDocument)?._id
        ? String((item.content as ContentDocument)._id)
        : "";

    const typeId =
      typeof item.delivery?.type === "string"
        ? item.delivery.type
        : (item.delivery?.type as DeliveryTypeDocument)?._id
        ? String((item.delivery.type as DeliveryTypeDocument)._id)
        : "";

    const slotId =
      typeof item.delivery?.slot === "string"
        ? item.delivery.slot
        : (item.delivery?.slot as TimeSlotDocument)?._id
        ? String((item.delivery.slot as TimeSlotDocument)._id)
        : "";

    let updatedItem = {
      ...item,
      content: contentId || item.content,
      delivery: {
        ...(item.delivery || {}),
        type: typeId || item.delivery?.type,
        slot: slotId || item.delivery?.slot,
        date: item.delivery?.date
      }
    } as CartItemDocument;

    const updatedAddons = item.addons
      ? item.addons.map(
        (adn) =>
          ({
            ...adn,
            addon:
              typeof adn.addon === "string"
                ? adn.addon
                : (adn.addon as AddonDocument)?._id
                ? String((adn.addon as AddonDocument)._id)
                : ""
          }) as CartItemAddonDocument
      )
      : undefined;

    const updatedCustomization = item.customization
      ? ({
        ...item.customization,
        flavour: item.customization.flavour
          ? {
            ...item.customization.flavour,
            flavour:
              typeof item.customization.flavour.flavour === "string"
                ? item.customization.flavour.flavour
                : (item.customization.flavour.flavour as FlavourDocument)?._id
                ? String((item.customization.flavour.flavour as FlavourDocument)._id)
                : ""
          }
          : undefined,
        upgrade: item.customization.upgrade
          ? {
            ...item.customization.upgrade,
            upgrade:
              typeof item.customization.upgrade.upgrade === "string"
                ? item.customization.upgrade.upgrade
                : (item.customization.upgrade.upgrade as UpgradeDocument)?._id
                ? String((item.customization.upgrade.upgrade as UpgradeDocument)._id)
                : ""
          }
          : undefined,
        uploadedImage: item.customization.uploadedImage
          ? {
            ...item.customization.uploadedImage,
            images: Array.isArray(item.customization.uploadedImage.images)
              ? (
                item.customization.uploadedImage
                  .images as CustomizationImageDocument[]
              ).map((img) => (typeof img === "string" ? img : String((img as any)?._id || "")))
              : []
          }
          : undefined,
        enhancement: item.customization.enhancement
          ? {
            ...item.customization.enhancement,
            items: (item.customization.enhancement.items || []).map(
              ({ price, enhancement }) => ({
                price,
                enhancement:
                  typeof enhancement === "string"
                    ? enhancement
                    : (enhancement as EnhancementDocument)?._id
                    ? String((enhancement as EnhancementDocument)._id)
                    : ""
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
    ? typeof cart.coupon === "string"
      ? cart.coupon
      : (cart.coupon as CouponDocument)?._id
      ? String((cart.coupon as CouponDocument)._id)
      : undefined
    : undefined;

  // checkout
  let updatedCheckout = cart.checkout
    ? ({
      ...cart.checkout,
      occasion: cart.checkout.occasion
        ? typeof cart.checkout.occasion === "string"
          ? cart.checkout.occasion
          : (cart.checkout.occasion as OccasionDocument)?._id
          ? String((cart.checkout.occasion as OccasionDocument)._id)
          : undefined
        : undefined,
      venue: cart.checkout.venue
        ? typeof cart.checkout.venue === "string"
          ? cart.checkout.venue
          : (cart.checkout.venue as VenueDocument)?._id
          ? String((cart.checkout.venue as VenueDocument)._id)
          : undefined
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
