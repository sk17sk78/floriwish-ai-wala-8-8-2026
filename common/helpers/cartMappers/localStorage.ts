// constants
import {
  CART_COUPON_LOCAL_KEY,
  CART_ITEMS_LOCAL_KEY,
  CART_ITEM_CHOICES_LOCAL_KEY,
  CART_DELIVERY_DETAILS_LOCAL_KEY,
  CART_DOCUMENTS_LOCAL_KEY,
  CART_PAYMENT_PERCENTAGE_LOCAL_KEY
} from "@/common/constants/localStorageKeys";
import { CouponDocument } from "@/common/types/documentation/contents/coupon";
import { CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";

// utils
import { getLocalStorage, setLocalStorage } from "@/common/utils/storage/local";
import { CartItemChoiceType } from "@/components/(frontend)/transaction/cart/static/types";

// types
import {
  CartItemType,
  DeliveryDetailsType,
  TransactionPriceSummaryType
} from "@/components/pages/(frontend)/Transaction/Cart/CartWithHook";

// CART ITEMS ----------------------------------
export const setLocalStorageCartItems = (items: CartItemType[]): void => {
  setLocalStorage({
    key: CART_ITEMS_LOCAL_KEY,
    value: items
  });
};

export const getLocalStorageCartItems = (): CartItemType[] | null => {
  return getLocalStorage({
    key: CART_ITEMS_LOCAL_KEY
  });
};

// CART ITEM CHOICES ----------------------------------
export const setLocalStorageCartItemChoices = (
  items: CartItemChoiceType[]
): void => {
  setLocalStorage({
    key: CART_ITEM_CHOICES_LOCAL_KEY,
    value: items
  });
};

export const getLocalStorageCartItemChoices = ():
  | CartItemChoiceType[]
  | null => {
  return getLocalStorage({
    key: CART_ITEM_CHOICES_LOCAL_KEY
  });
};

// CART PAYMENT PERCENTAGE ----------------------------------
export const setLocalStorageCartPrice = (paymentPercentage: number): void => {
  setLocalStorage({
    key: CART_PAYMENT_PERCENTAGE_LOCAL_KEY,
    value: paymentPercentage
  });
};

export const getLocalStorageCartPrice = (): number | null => {
  return getLocalStorage({
    key: CART_PAYMENT_PERCENTAGE_LOCAL_KEY
  });
};

// CART DELIVERY DETAILS ----------------------------------
export const setLocalStorageCartDeliveryDetails = (
  details: DeliveryDetailsType
): void => {
  setLocalStorage({
    key: CART_DELIVERY_DETAILS_LOCAL_KEY,
    value: details
  });
};

export const getLocalStorageCartDeliveryDetails =
  (): DeliveryDetailsType | null => {
    return getLocalStorage({
      key: CART_DELIVERY_DETAILS_LOCAL_KEY
    });
  };

// CART COUPON ----------------------------------
export const setLocalStorageCartCoupon = (
  details: CouponDocument | null
): void => {
  try {
    setLocalStorage({
      key: CART_COUPON_LOCAL_KEY,
      value: details
    });
  } catch (error) {
    // Try to clear the key if setting fails
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(CART_COUPON_LOCAL_KEY);
      }
    } catch (clearError) {
    }
  }
};

export const getLocalStorageCartCoupon = (): CouponDocument | null => {
  return getLocalStorage({
    key: CART_COUPON_LOCAL_KEY
  });
};

// CART DISTINCT CONTENT DOCUMENTS ----------------------
export const setLocalStorageContentDocuments = (
  cartItems: CartItemDocument[]
) => {
  try {
    // Safety check for input
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }

    let hashmap: Record<string, boolean> = {};

    // Safe iteration with error handling
    cartItems.forEach((item) => {
      try {
        if (item && item._id) {
          hashmap[String(item._id)] = true;
        }
      } catch (itemError) {
      }
    });

    const distinctItems: CartItemDocument[] = Object.keys(hashmap)
      .map((id) => {
        try {
          return cartItems.find(({ _id }) => {
            try {
              return String(_id) === id;
            } catch (findError) {
              return false;
            }
          });
        } catch (mapError) {
          return undefined;
        }
      })
      .filter((x) => x !== undefined) as CartItemDocument[];

    setLocalStorage({ key: CART_DOCUMENTS_LOCAL_KEY, value: distinctItems });
  } catch (error) {
    // Fallback: try to set empty array
    try {
      setLocalStorage({ key: CART_DOCUMENTS_LOCAL_KEY, value: [] });
    } catch (fallbackError) {
    }
  }
};

export const getLocalStorageContentDocuments = ():
  | CartItemDocument[]
  | null => {
  return getLocalStorage({ key: CART_DOCUMENTS_LOCAL_KEY });
};
