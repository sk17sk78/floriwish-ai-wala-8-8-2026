// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Carts, Customers } = models;

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";
import { type MongooseErrorType } from "@/common/types/apiTypes";
import { isDateExpired } from "./utils/isDateExpired";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { fetchContentPageData } from "@/request/content/contentPageData";
import { CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";

// constants
const SELECT = {
  cart: ["isOrdered", "customer", "items", "price", "checkout", "coupon"],
  content: [
    "name",
    "slug",
    "category",
    "media.video",
    "availability",
    "detail.includes",
    "detail.excludes",
    "quality",
    "delivery",
    "price",
    "edible",
    "customization",
    "addons",
    "variants"
  ],
  image: ["alt", "defaultAlt", "url"]
};

// Helper to link or create customer when checkout details are entered
async function syncCustomerFromCheckout(cart: any) {
  if (!cart?.checkout) return;

  const name = cart.checkout.name?.trim();
  const mobile = cart.checkout.contact?.mobileNumber?.trim();
  const email = cart.checkout.contact?.mail?.trim();
  const address = cart.checkout.location?.address?.trim();
  const city = cart.checkout.location?.city?.trim() || "";
  const pincode = cart.checkout.location?.pincode?.trim() || "";
  const landmark = cart.checkout.location?.landmark?.trim() || "";

  if (!name && !mobile && !email) return;

  try {
    let customerDoc: any = null;

    if (cart.customer) {
      customerDoc = await Customers.findById(cart.customer);
    }

    if (!customerDoc && mobile) {
      customerDoc = await Customers.findOne({ mobileNumber: mobile });
    }

    if (!customerDoc && email) {
      customerDoc = await Customers.findOne({ mail: email });
    }

    if (!customerDoc && name) {
      customerDoc = await Customers.findOne({ name: name });
    }

    if (customerDoc) {
      if (name) customerDoc.name = name;
      if (mobile) customerDoc.mobileNumber = mobile;
      if (email) customerDoc.mail = email;
      if (!customerDoc.createdBy) customerDoc.createdBy = name || "Customer";
      customerDoc.updatedBy = name || customerDoc.name || "Customer Checkout";

      if (address) {
        if (!customerDoc.addresses) customerDoc.addresses = [];
        const existingAddrIndex = customerDoc.addresses.findIndex(
          (a: any) => a.address === address
        );
        if (existingAddrIndex >= 0) {
          customerDoc.addresses[existingAddrIndex].city = city || customerDoc.addresses[existingAddrIndex].city;
          customerDoc.addresses[existingAddrIndex].pincode = pincode || customerDoc.addresses[existingAddrIndex].pincode;
          customerDoc.addresses[existingAddrIndex].landmark = landmark || customerDoc.addresses[existingAddrIndex].landmark;
        } else {
          customerDoc.addresses.unshift({
            address,
            city,
            pincode,
            landmark,
            type: "Default",
            isDefault: true
          });
        }
      }

      if (cart._id) {
        customerDoc.cart = cart._id;
      }
      await customerDoc.save();
      cart.customer = customerDoc._id;
    } else {
      // Create new customer for guest who filled checkout
      const newCustomer = new Customers({
        name: name || "Customer",
        mobileNumber: mobile || "",
        mail: email || "",
        status: "active",
        conversionStatus: "new",
        createdBy: name || "Guest Checkout",
        updatedBy: name || "Guest Checkout",
        addresses: address
          ? [
              {
                address,
                city,
                pincode,
                landmark,
                type: "Default",
                isDefault: true
              }
            ]
          : [],
        orders: [],
        cart: cart._id || undefined
      });
      await newCustomer.save();
      cart.customer = newCustomer._id;
    }
  } catch (err) {
    console.error("[syncCustomerFromCheckout] Error syncing customer:", err);
  }
}

function sanitizeCartData(cart: any) {
  if (!cart) return cart;
  const sanitized = { ...cart };
  if (Array.isArray(sanitized.items)) {
    sanitized.items = sanitized.items.map((item: any) => {
      const contentId =
        typeof item.content === "object" && item.content !== null
          ? item.content._id
          : item.content;

      const deliveryDate =
        item.delivery?.date && !isNaN(new Date(item.delivery.date).getTime())
          ? new Date(item.delivery.date)
          : undefined;

      const deliveryType =
        item.delivery?.type && typeof item.delivery.type === "object"
          ? item.delivery.type._id
          : item.delivery?.type;

      const deliverySlot =
        item.delivery?.slot && typeof item.delivery.slot === "object"
          ? item.delivery.slot._id
          : item.delivery?.slot;

      return {
        ...item,
        content: contentId,
        delivery: item.delivery
          ? {
              ...item.delivery,
              date: deliveryDate,
              type: deliveryType,
              slot: deliverySlot
            }
          : undefined,
        addons: Array.isArray(item.addons)
          ? item.addons.map((adn: any) => ({
              ...adn,
              addon:
                typeof adn.addon === "object" && adn.addon !== null
                  ? adn.addon._id
                  : adn.addon
            }))
          : item.addons
      };
    });
  }

  if (sanitized.checkout) {
    let occasion = sanitized.checkout.occasion;
    if (occasion && typeof occasion === "object" && occasion._id) {
      occasion = occasion._id;
    }
    let venue = sanitized.checkout.venue;
    if (venue && typeof venue === "object" && venue._id) {
      venue = venue._id;
    }
    sanitized.checkout = {
      ...sanitized.checkout,
      occasion,
      venue
    };
  }

  return sanitized;
}

export const addCart = async ({
  cart
}: {
  cart: CartDocument;
}): Promise<CartDocument | null> => {
  try {
    await connectDB();

    await syncCustomerFromCheckout(cart);

    const sanitizedCart = sanitizeCartData(cart);
    const newDocument = new Carts(sanitizedCart);
    const document = await newDocument.save();

    if (!document) {
      return null;
    }

    // Link customer's cart property to new cart
    if (document.customer) {
      await Customers.findByIdAndUpdate(document.customer, {
        cart: document._id
      });
    }

    return document;
  } catch (error: any) {
    console.error("[addCart] error:", error?.message || error);
    return null;
  }
};

export const getCart = async ({
  id
}: {
  id: string;
}): Promise<CartDocument | null> => {
  try {
    await connectDB();

    const document = await Carts.findById(id)
      .select(SELECT.cart)
      .populate([
        {
          path: "items.content",
          select: SELECT.content,
          populate: { path: "media.primary", select: SELECT.image },
          strictPopulate: false
        },
        { path: "items.delivery.type", strictPopulate: false },
        {
          path: "items.addons.addon",
          populate: { path: "image", select: SELECT.image },
          strictPopulate: false
        },
        {
          path: "items.customization.enhancement.items.enhancement",
          strictPopulate: false
        },
        {
          path: "items.customization.upgrade.upgrade",
          strictPopulate: false
        },
        {
          path: "items.customization.flavour.flavour",
          strictPopulate: false
        },
        { path: "coupon", strictPopulate: false }
      ]);

    if (!document) {
      return null;
    }

    const docObj = document.toObject() as CartDocument;

    const mappedItems = [...(docObj.items || [])].map((item) => {
      const validItem = { ...item } as CartItemDocument;

      if (validItem.delivery?.type) {
        validItem.delivery.slot = (
          validItem.delivery.type as DeliveryTypeDocument
        )?.timeSlots?.find(
          ({ _id }) => String(_id) === String(validItem.delivery?.slot)
        ) || validItem.delivery.slot;
      }

      return validItem;
    });

    docObj.items = mappedItems;

    return docObj;
  } catch (error: any) {
    console.error("[getCart] error:", error);
    return null;
  }
};

export const updateCart = async ({
  id,
  cart
}: {
  id: string;
  cart: CartDocument;
}): Promise<CartDocument | null> => {
  try {
    await connectDB();

    await syncCustomerFromCheckout(cart);

    const sanitizedCart = sanitizeCartData(cart);

    const document = await Carts.findByIdAndUpdate(
      id,
      sanitizedCart as Partial<CartDocument>,
      { new: true }
    );

    if (!document) {
      console.error("[updateCart] Cart not found for id:", id);
      return null;
    }

    if (document.customer) {
      await Customers.findByIdAndUpdate(document.customer, {
        cart: document._id
      });
    }

    return document;
  } catch (error: any) {
    console.error("[updateCart] error:", error?.message || error);
    return null;
  }
};
