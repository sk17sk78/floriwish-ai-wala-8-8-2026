/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { REGEX_TEST } from "@/common/constants/regex";
import {
  extractAppliedCoupon,
  extractCartDetails,
  extractCartItems,
  extractDeliveryDetails,
  extractPrice,
  filterRelevantCoupons,
  getPartialPercentage,
} from "@/common/helpers/cartMappers/funnelDownToCart";
import {
  excludePartialCheckout,
  getDatabaseReadyCartDocument,
  removeLocalIds,
  updateCartPrices,
} from "@/common/helpers/cartMappers/getDatabaseFormatwiseData";
import {
  getLocalStorageCartCoupon,
  getLocalStorageCartPrice,
  getLocalStorageContentDocuments,
  setLocalStorageCartCoupon,
  setLocalStorageCartDeliveryDetails,
  setLocalStorageCartPrice,
  setLocalStorageContentDocuments,
} from "@/common/helpers/cartMappers/localStorage";
import {
  handleAddNewItemToCart,
  handleCartItemInteractionUpdates,
  mergeLocalAndAPICartData,
  updateMasterCartPrices,
} from "@/common/helpers/cartMappers/manageCartContext";
import { CouponDocument } from "@/common/types/documentation/contents/coupon";
import { CartDocument } from "@/common/types/documentation/dynamic/cart";
import { CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";
import { CartCheckoutContactDocument } from "@/common/types/documentation/nestedDocuments/cartCheckoutContact";
import { CartCheckoutLocationDocument } from "@/common/types/documentation/nestedDocuments/cartCheckoutLocation";
import { CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { CartPriceDocument } from "@/common/types/documentation/nestedDocuments/cartPrice";
import { CustomerAddressDocument } from "@/common/types/documentation/nestedDocuments/customerAddress";
import { OccasionDocument } from "@/common/types/documentation/presets/occasion";
import { CartItemChoiceType } from "@/components/(frontend)/transaction/cart/static/types";
import {
  CartItemType,
  DeliveryDetailsType,
  TransactionPriceSummaryType,
} from "@/components/pages/(frontend)/Transaction/Cart/CartWithHook";
import { CONTENT_POPULATE } from "@/request/content/contents";
import { fetchAllCoupons } from "@/request/coupon/coupons";
import { addCart, fetchCart, updateCart } from "@/request/dynamic/cart/request";
import { fetchOccasions } from "@/request/preset/occasion";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCustomerProfile } from "./useCustomerProfile";
// import { PincodeDocument } from "@/common/types/documentation/presets/pincode";
import { CustomerDetail } from "./useAppState/types/profile";
import { useAppStates } from "./useAppState/useAppState";

const DEFAULT_PRICE_DOCUMENT: CartPriceDocument = {
  content: 0,
  addon: 0,
  customization: 0,
  deliveryCharge: 0,
  paymentPercentage: 100,
  couponDiscount: 0,
} as CartPriceDocument;

const DEFAULT_CHECKOUT_DOCUMENT: CartCheckoutDocument = {
  name: "",
  contact: {
    mobileNumber: "",
    mail: "",
  },
  location: {
    address: "",
    city: "",
    pincode: "",
  },
} as CartCheckoutDocument;

const DEFAULT_CART_DOCUMENT: CartDocument = {
  isOrdered: false,
  checkout: DEFAULT_CHECKOUT_DOCUMENT,
  price: DEFAULT_PRICE_DOCUMENT,
  items: [] as CartItemDocument[],
  customer: "",
} as CartDocument;

type LocalStorageCart = {
  items: CartItemType[];
  itemDetails: CartItemChoiceType[];
  appliedCoupon: CouponDocument | null;
  deliveryDetails: DeliveryDetailsType;
  price: TransactionPriceSummaryType;
};

// CONTEXT STARTS HERE ===============================================

// data shown will match the types for /cart page types (CartPage.tsx)
type Cart = {
  data: {
    items: CartItemType[];
    itemDetails: CartItemChoiceType[];
    price: TransactionPriceSummaryType;
    deliveryDetails: DeliveryDetailsType;
    appliedCoupon: CouponDocument | null;
    allCoupons: CouponDocument[];
    partialPercentage: number;
    occasions: OccasionDocument[];
    isCheckoutComplete: { status: boolean; message: string };
  };
  cartFunctions: {
    updateCartContext: {
      updateItems: ({
        items,
        itemDetails,
      }: {
        items: CartItemType[];
        itemDetails: CartItemChoiceType[];
      }) => void;
      updatePaymentPercentage: (
        selectedPercentage: number,
        options?: { silent?: boolean },
      ) => void;
      updateSelectedCoupon: (selectedCoupon: CouponDocument | null) => void;
      updateDeliveryDetails: (updatedDetails: DeliveryDetailsType) => void;
    };
    clearCart: () => void;
  };
  addToCartFunctions: {
    addItem: (details: CartItemDocument) => void;
  };
};

const Cart = createContext<Cart>({
  addToCartFunctions: {
    addItem: () => {},
  },
  data: {
    items: [],
    itemDetails: [],
    price: {
      base: 0,
      addon: 0,
      paymentPercentage: 0,
      coupon: 0,
      platform: 0,
    },
    deliveryDetails: {
      address: "",
      city: "",
      email: "",
      mobile: "",
      name: "",
      occasion: "",
      pincode: "",
      type: "default",
    },
    appliedCoupon: null,
    allCoupons: [],
    partialPercentage: 100,
    occasions: [],
    isCheckoutComplete: { message: "", status: false },
  },
  cartFunctions: {
    updateCartContext: {
      updateItems: function ({
        items,
        itemDetails,
      }: {
        items: CartItemType[];
        itemDetails: CartItemChoiceType[];
      }): void {},
      updatePaymentPercentage: function (updatedPercentage: number): void {},
      updateSelectedCoupon: function (
        selectedCoupon: CouponDocument | null,
      ): void {},
      updateDeliveryDetails: function (
        updatedDetails: DeliveryDetailsType,
      ): void {},
    },
    clearCart: () => {},
  },
});

/*
POINTS TO READ FOR THIS CONTEXT: 
- the /cart route doesn't require the entire ContentDocument to work
- in-fact, having to each time find the correct price from PriceDocument is cumbersome
- the state in this context manages the CartDocument as a whole 
- only the necessary data is funnelled down to the /cart page (CartPage.tsx)
- any updates to cart page, is pushed back up to this context which updates the master state which in turns updates the cart page

- funnelling down helper functions:
    - cartItems:        extractCartItems
    - cartDetails:      extractCartDetails
    - cartPrice:        extractPrice
    - deliveryDetails:  extractDeliveryDetails
    - appliedCoupon:    extractAppliedCoupon

- push up helper functions:
    - updateItems:           updateMasterCartItems
    - updatePrice:           updateMasterCartPrice
    - updateSelectedCoupon:  updateMasterCartDeliveryDetails
    - updateDeliveryDetails: updateMasterCartAppliedCoupon
*/

export function CartProvider({ children }: { children: ReactNode }) {
  // master data
  const [theCart, setTheCart] = useState<CartDocument>(DEFAULT_CART_DOCUMENT);
  const [allCoupons, setAllCoupons] = useState<CouponDocument[]>([]);
  const [apiCalled, setApiCalled] = useState<boolean>(false);
  const [saveToLS, setSaveToLS] = useState<boolean>(false);
  const [updatePrice, setUpdatePrice] = useState<boolean>(false);
  const [dontSaveToDB, setDontSaveToDB] = useState<boolean>(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [allOccasions, setALlOccasions] = useState<OccasionDocument[]>([]);
  const [exclusiveInject, setExclusiveInject] = useState<
    "none" | "cart" | "delivery"
  >("none");
  const [saveCartAsNewDocToDB, setSaveCartAsNewDocToDB] = useState<{
    truthy: boolean;
    triggered: boolean;
  }>({ triggered: false, truthy: false });
  const [isCheckoutComplete, setIsCheckoutComplete] = useState<{
    status: boolean;
    message: string;
  }>(() => {
    // Safe initialization
    try {
      return { message: "", status: false };
    } catch (error) {
      return { message: "Initialization error", status: false };
    }
  });

  const isInitializedRef = useRef<boolean>(false);

  const isDirtyRef = useRef<boolean>(false);

  const {
    isReady,
    location: {
      data: { selectedCity },
    },
    auth: {
      data: { isAuthenticated: isUserLoggedIn, customerId },
    },
    profile: {
      data: { detail: customerDetailsFromContext, addresses, cartId },
    },
  } = useAppStates();
  const {
    cart: { onAdd: addCartId },
    detail: { onChange: updateCustomerDetailsToContext },
    address: { onAdd: addAddressToCustomer },
  } = useCustomerProfile();

  // content page handlers -------------------------------------------------
  const addItemToCart = (newItem: CartItemDocument) => {
    isDirtyRef.current = true;
    handleAddNewItemToCart({ cart: theCart, newItem, setCart: setTheCart });
    setUpdatePrice((prev) => true);

    // idk why this works only V
    setTimeout(() => setExclusiveInject((prev) => "cart"), 300);
  };

  // push up to context function handlers -------------------------------------------------
  const updateMasterCartItems = ({
    items,
    itemDetails,
  }: {
    items: CartItemType[];
    itemDetails: CartItemChoiceType[];
  }) => {
    isDirtyRef.current = true;
    handleCartItemInteractionUpdates({
      cart: theCart,
      setCart: setTheCart,
      updatedItemChoices: itemDetails,
      updatedItems: items,
    });
    setUpdatePrice((prev) => true);

    // idk why this works only V
    setTimeout(() => setExclusiveInject((prev) => "cart"), 300);
  };

  const updateMasterCartPaymentPercentage = (
    updatedPercentage: number,
    options?: { silent?: boolean },
  ) => {
    const currentPercentage = theCart.price?.paymentPercentage || 100;
    if (currentPercentage === updatedPercentage) {
      return;
    }
    if (!options?.silent) {
      isDirtyRef.current = true;
    }
    setTheCart(
      (prev) =>
        ({
          ...prev,
          price: { ...prev.price, paymentPercentage: updatedPercentage },
        }) as CartDocument,
    );
    setUpdatePrice((prev) => true);
    setLocalStorageCartPrice(
      theCart.price.paymentPercentage ? theCart.price.paymentPercentage : 100,
    );
  };

  const updateMasterCartDeliveryDetails = (
    updatedDetails: DeliveryDetailsType,
    options?: { silent?: boolean },
  ) => {
    let currentDeliveryDetails: DeliveryDetailsType;
    try {
      currentDeliveryDetails = extractDeliveryDetails(theCart);
    } catch (error: any) {
      currentDeliveryDetails = {
        address: "",
        city: "",
        email: "",
        mobile: "",
        occasion: "",
        pincode: "",
        type: "default",
        name: "",
      };
    }
    if (
      JSON.stringify(currentDeliveryDetails) ===
      JSON.stringify(updatedDetails as DeliveryDetailsType)
    ) {
      return;
    }
    if (!options?.silent) {
      isDirtyRef.current = true;
    }
    const updatedName = updatedDetails.name || "";
    const updatedMobileNumber = updatedDetails.mobile;
    const updatedEmail = updatedDetails.email;
    const updatedAddress = updatedDetails.address || "";
    setTheCart(
      (prev) =>
        ({
          ...prev,
          checkout: {
            name: updatedName,
            contact: {
              mobileNumber: updatedMobileNumber,
              mail: updatedEmail,
            } as CartCheckoutContactDocument,
            location: {
              address: updatedAddress,
              city: updatedDetails.city || "",
              pincode: updatedDetails.pincode,
            } as CartCheckoutLocationDocument,
            deliverToSomeoneElse:
              updatedDetails.type === "default" ? false : true,
            receiverName:
              updatedDetails.type === "default"
                ? ""
                : updatedDetails.receiverName,
            receiverMobileNumber:
              updatedDetails.type === "default"
                ? ""
                : updatedDetails.receiverMobile,
            occasion:
              updatedDetails.occasion &&
              updatedDetails.occasion === updatedDetails.occasion
                ? updatedDetails.occasion
                : undefined,
          } as CartCheckoutDocument,
        }) as CartDocument,
    );
    if ((!addresses || !addresses[0]) && isUserLoggedIn && userLoggedIn) {
      // add address to this user
      const newAddress = {
        address: updatedAddress,
        city: updatedDetails.city,
        pincode: updatedDetails.pincode,
        type: "",
        isDefault: true,
      } as CustomerAddressDocument;

      addAddressToCustomer(newAddress);
    }

    if (
      userLoggedIn &&
      isUserLoggedIn &&
      customerDetailsFromContext !== null &&
      ((customerDetailsFromContext.name && !customerDetailsFromContext.name) ||
        customerDetailsFromContext.mail === undefined ||
        (customerDetailsFromContext.mail && !customerDetailsFromContext.mail) ||
        customerDetailsFromContext.mobileNumber === undefined ||
        (customerDetailsFromContext.mobileNumber &&
          !customerDetailsFromContext.mobileNumber))
    ) {
      const updatedCustomer = {
        name: customerDetailsFromContext.name || updatedName || "",
        mobileNumber:
          customerDetailsFromContext.mobileNumber || updatedMobileNumber || "",
        mail: customerDetailsFromContext.mail || updatedEmail || "",
      } as CustomerDetail;

      updateCustomerDetailsToContext(updatedCustomer);
    }

    // idk why this works only V
    setTimeout(() => setExclusiveInject((prev) => "delivery"), 300);
  };

  const updateMasterCartAppliedCoupon = (
    selectedCoupon: CouponDocument | null,
    options?: { silent?: boolean },
  ) => {
    const currentCouponId = theCart.coupon
      ? String((theCart.coupon as any)?._id || theCart.coupon)
      : undefined;
    const nextCouponId = selectedCoupon
      ? String(selectedCoupon._id)
      : undefined;
    if (
      (currentCouponId === undefined && nextCouponId === undefined) ||
      (currentCouponId !== undefined &&
        nextCouponId !== undefined &&
        currentCouponId === nextCouponId)
    ) {
      return;
    }
    if (!options?.silent) {
      isDirtyRef.current = true;
    }
    setTheCart(
      (prev) =>
        ({
          ...prev,
          coupon:
            selectedCoupon === null || selectedCoupon === undefined
              ? undefined
              : selectedCoupon,
        }) as CartDocument,
    );
    setUpdatePrice((prev) => true);
  };

  const clearAllCartData = () => {
    try {
      // Safe cart clearing with comprehensive error handling
      // Clear state safely
      if (setTheCart && typeof setTheCart === "function") {
        setTheCart(DEFAULT_CART_DOCUMENT);
      }

      if (setUpdatePrice && typeof setUpdatePrice === "function") {
        setUpdatePrice(true);
      }

      if (setDontSaveToDB && typeof setDontSaveToDB === "function") {
        setDontSaveToDB(true);
      }

      // Clear localStorage safely
      try {
        if (typeof setLocalStorageCartCoupon === "function") {
          setLocalStorageCartCoupon(null);
        }
      } catch (couponError) {}

      try {
        if (typeof setLocalStorageContentDocuments === "function") {
          setLocalStorageContentDocuments([]);
        }
      } catch (documentsError) {}

      // Additional localStorage cleanup
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const keysToRemove = [
            "cart",
            "cartItems",
            "checkout",
            "deliveryDetails",
            "cartPrice",
            "cartCoupon",
            "contentDocuments",
          ];

          keysToRemove.forEach((key) => {
            try {
              localStorage.removeItem(key);
            } catch (removeError) {}
          });
        }
      } catch (storageError) {}
    } catch (error) {
      // Last resort: try to clear localStorage directly
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.clear();
        }
      } catch (fallbackError) {}
    }
  };

  // CART EFFECTS ===================================================================
  useEffect(() => {
    if (!theCart.items || !theCart.items[0]) {
      setTheCart((prev) => ({ ...prev, coupon: undefined }) as CartDocument);
      setSaveToLS(true);
    }
  }, [theCart.items]);

  useEffect(() => {
    if (saveToLS) {
      setLocalStorageCartCoupon(extractAppliedCoupon(theCart));
      setLocalStorageCartDeliveryDetails(extractDeliveryDetails(theCart));
      setLocalStorageContentDocuments(theCart.items || []);
      setLocalStorageCartPrice(theCart.price.paymentPercentage || 100);

      setSaveToLS(false);
    }
  }, [saveToLS]);

  useEffect(() => {
    if (updatePrice) {
      updateMasterCartPrices({ cart: theCart, setCart: setTheCart });
      setUpdatePrice(false);

      setSaveToLS(true);
    }
  }, [updatePrice]);

  useEffect(() => {
    if (exclusiveInject !== "none") {
      if (exclusiveInject === "cart")
        setLocalStorageContentDocuments(theCart.items || []);
      else if (exclusiveInject === "delivery")
        setLocalStorageCartDeliveryDetails(extractDeliveryDetails(theCart));
      setExclusiveInject((prev) => "none");
    }
  }, [exclusiveInject]);

  useEffect(() => {
    if (!apiCalled) {
      // get whatever data from LS...
      const cartItemDocuments: CartItemDocument[] =
        getLocalStorageContentDocuments() || [];
      const appliedCoupon = getLocalStorageCartCoupon() || null;
      const paymentPercentage = getLocalStorageCartPrice() || 100;
      // const deliveryDetails = getLocalStorageCartDeliveryDetails() || {
      //   address: "",
      //   city: "",
      //   email: "",
      //   mobile: "",
      //   name: "",
      //   occasion: "",
      //   pincode: "",
      //   type: "default"
      // };
      const deliveryDetails = {
        address: addresses?.find(({ isDefault }) => isDefault)?.address || "",
        city: addresses?.find(({ isDefault }) => isDefault)?.city || "",
        email: customerDetailsFromContext?.mail || "",
        mobile: customerDetailsFromContext?.mobileNumber || "",
        name: customerDetailsFromContext?.name || "",
        occasion: "",
        pincode: "",
        type: "default",
      } as DeliveryDetailsType;

      setTheCart(
        (prev) => ({ ...prev, items: cartItemDocuments }) as CartDocument,
      );
      updateMasterCartDeliveryDetails(deliveryDetails, { silent: true });
      updateMasterCartAppliedCoupon(appliedCoupon, { silent: true });
      // updateMasterCartPaymentPercentage(paymentPercentage);
      setUpdatePrice((prev) => true);
    }

    // GET ALL COUPONS ----------------------------
    fetchAllCoupons({
      active: true,
      orderBy: "asc",
      sortBy: "applicableCategories",
    })
      .then((response) => {
        const coupons = (response.data || []).filter((x) => x !== undefined);
        setAllCoupons((prev) => coupons);
      })
      .catch((err) => {});

    // GET OCCASIONS PRESETS ---------------------------------
    fetchOccasions({
      active: true,
      orderBy: "asc",
      sortBy: "name",
    })
      .then((response) => {
        const occasions = (response.data || []).filter((x) => x !== undefined);
        setALlOccasions((prev) => occasions);
      })
      .catch((err) => {});
  }, []);

  // API SYNCHRONIZATION ===============================================================
  useEffect(() => {
    if (isReady && customerId) {
      // login then read from api or push to api
      if (isUserLoggedIn && !apiCalled) {
        if (cartId && cartId) {
          setApiCalled((prev) => true);

          // Guard against a stale dirty flag from a previous session causing immediate PATCH loops.
          isDirtyRef.current = false;
          isLoadingFromAPIRef.current = true;
          fetchCart({
            cartId,
            query: {
              populate: [
                { path: "items.content", populate: CONTENT_POPULATE },
                { path: "items.delivery.type", strict: false },
                {
                  path: "items.addons.addon",
                  populate: [{ path: "category" }, { path: "image" }],
                },
                { path: "items.customization.enhancement.items.enhancement" },
                { path: "items.customization.flavour.flavour" },
                { path: "items.customization.upgrade.upgrade" },
                { path: "items.customization.uploadedImage.images" },
              ],
            },
          }).then((cartData) => {
            if (cartData.data !== null) {
              isLoadingFromAPIRef.current = true;
              isDirtyRef.current = false;
              const [shouldUpdateCart, mergedCartData] =
                mergeLocalAndAPICartData({
                  local: theCart,
                  fromAPI: cartData.data as CartDocument,
                });
              if (shouldUpdateCart) {
                // Prevent sync when loading from API - this is server data, not local changes
                setDontSaveToDB(true);
                isDirtyRef.current = false;
                setTheCart((prev) => mergedCartData);
                setUpdatePrice((prev) => true);
                // Mark the loaded cart as synced after state update
                setTimeout(() => {
                  try {
                    const { customer, ...cartWithoutCustomer } = mergedCartData;
                    const preparedCart = updateCartPrices(
                      getDatabaseReadyCartDocument(
                        removeLocalIds(
                          excludePartialCheckout(
                            cartWithoutCustomer as CartDocument,
                          ),
                        ) as CartDocument,
                      ),
                    );
                    const normalizedItems = (preparedCart.items || []).map(
                      (item) => {
                        const dateVal = (item as any)?.delivery?.date;
                        const normalizedDate =
                          typeof dateVal === "string"
                            ? dateVal
                            : dateVal
                              ? new Date(dateVal).toISOString()
                              : "";
                        return {
                          ...item,
                          delivery: {
                            ...(item as any).delivery,
                            date: normalizedDate,
                          },
                        };
                      },
                    );
                    const stableCart = {
                      ...preparedCart,
                      items: normalizedItems,
                      price: {
                        paymentPercentage:
                          mergedCartData.price?.paymentPercentage || 100,
                      },
                    };
                    const mergedHash = JSON.stringify(stableCart);
                    lastSyncedCartRef.current = mergedHash;
                    lastAttemptedCartHashRef.current = mergedHash;
                    isDirtyRef.current = false;
                    isLoadingFromAPIRef.current = false;
                    setDontSaveToDB(false);
                  } catch (e) {
                    isLoadingFromAPIRef.current = false;
                    setDontSaveToDB(false);
                  }
                }, 500);
              } else {
                isLoadingFromAPIRef.current = false;
              }
            } else {
              isLoadingFromAPIRef.current = false;
            }
          });
        } else {
          // save new cart document for this user and push cart id into context
          setTimeout(() => {
            if (
              (!cartId || !cartId) &&
              !saveCartAsNewDocToDB.triggered &&
              !saveCartAsNewDocToDB.truthy
            )
              setSaveCartAsNewDocToDB((prev) => ({
                triggered: false,
                truthy: true,
              }));
          }, 8 * 1000);
        }
      }
    }
  }, [cartId, isUserLoggedIn, isReady, customerId]);

  // WHEN NO CART ID IS RECIEVED AFTER LOGIN THEN PUSH TO DB AS IS ------------
  useEffect(() => {
    if (
      !saveCartAsNewDocToDB.triggered &&
      saveCartAsNewDocToDB.truthy &&
      (!cartId || !cartId) &&
      theCart !== DEFAULT_CART_DOCUMENT
    ) {
      addCart({
        data: removeLocalIds(
          excludePartialCheckout({
            ...theCart,
            customer: customerId,
          } as CartDocument),
        ) as CartDocument,
      }).then((cartData) => {
        const cartId = String((cartData.data as CartDocument)._id);
        if (cartId) {
          addCartId(cartId);
        }
      });
      setSaveCartAsNewDocToDB((prev) => ({ triggered: true, truthy: false }));
    }
  }, [saveCartAsNewDocToDB]);

  // useRef to track the last version of the cart that was synced to the server
  const lastSyncedCartRef = useRef<string>("");
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncCountRef = useRef<number>(0);
  const lastAttemptedCartHashRef = useRef<string>("");
  const isCustomerAssigningRef = useRef<boolean>(false);
  const isSyncInFlightRef = useRef<boolean>(false);
  const isLoadingFromAPIRef = useRef<boolean>(false);
  // Track last computed hash for debugging only (do NOT use for sync gating).
  const lastComputedCartHashRef = useRef<string>("");

  const cartPayloadForSync = useMemo(() => {
    try {
      // Safe cart validation
      if (!theCart || typeof theCart !== "object") {
        return null;
      }

      const { customer, ...cartWithoutCustomer } = theCart;

      // Safe processing with error handling
      try {
        const processedCart = updateCartPrices(
          getDatabaseReadyCartDocument(
            removeLocalIds(
              excludePartialCheckout(cartWithoutCustomer as CartDocument),
            ) as CartDocument,
          ),
        );
        return processedCart;
      } catch (processingError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }, [theCart?.items, theCart?.checkout, theCart?.price, theCart?.coupon]);

  // Compute a stable hash of the cart for dependency tracking.
  // Important: exclude derived price fields (they can be recalculated) to avoid infinite PATCH loops.
  const cartHash = useMemo(() => {
    try {
      // Early return for invalid payload
      if (!cartPayloadForSync || typeof cartPayloadForSync !== "object") {
        return JSON.stringify({ items: [], price: { paymentPercentage: 100 } });
      }

      // Safe items processing
      let normalizedItems: any[] = [];
      try {
        normalizedItems = (cartPayloadForSync.items || []).map((item) => {
          try {
            if (!item || typeof item !== "object") {
              return { id: "fallback" };
            }

            const dateVal = (item as any)?.delivery?.date;
            const normalizedDate =
              typeof dateVal === "string"
                ? dateVal
                : dateVal
                  ? new Date(dateVal).toISOString()
                  : "";

            return {
              ...item,
              delivery: {
                ...(item as any).delivery,
                date: normalizedDate,
              },
            };
          } catch (itemError) {
            return item || { id: "error-fallback" };
          }
        });
      } catch (mapError) {
        normalizedItems = [];
      }

      // Safe cart construction
      const stableCart = {
        items: normalizedItems,
        price: {
          paymentPercentage: theCart?.price?.paymentPercentage || 100,
        },
      };

      // Safe JSON stringification
      let hash = "";
      try {
        hash = JSON.stringify(stableCart);
      } catch (stringifyError) {
        hash = JSON.stringify({ items: [], price: { paymentPercentage: 100 } });
      }

      // Final validation
      if (
        !hash ||
        typeof hash !== "string" ||
        hash === "null" ||
        hash === "undefined"
      ) {
        return JSON.stringify({ items: [], price: { paymentPercentage: 100 } });
      }

      return hash;
    } catch (error) {
      // Return a guaranteed safe fallback hash
      return JSON.stringify({ items: [], price: { paymentPercentage: 100 } });
    }
  }, [cartPayloadForSync, theCart?.price?.paymentPercentage]);

  // UPDATE CART DATA TO DATABASE -----------------------------------------------
  useEffect(() => {
    // Clear any pending sync timer
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    if (isSyncInFlightRef.current) {
      return;
    }

    // Only proceed if we have a cartId and basic login state
    if (
      !apiCalled ||
      !isUserLoggedIn ||
      !userLoggedIn ||
      !cartId ||
      dontSaveToDB ||
      isCustomerAssigningRef.current ||
      isLoadingFromAPIRef.current
    ) {
      if (dontSaveToDB) setDontSaveToDB(false);
      return;
    }

    if (!isDirtyRef.current) {
      return;
    }

    // Validate cartHash before proceeding - COMPLETELY SAFE
    if (!cartHash || typeof cartHash !== "string" || cartHash === "") {
      return;
    }

    // If we've already attempted to sync this exact payload hash, don't keep retrying in a loop.
    // This is a safety net against rehydration/derived-state feedback loops.
    if (lastAttemptedCartHashRef.current === cartHash) {
      isDirtyRef.current = false;
      return;
    }

    // Debounce: wait 500ms before syncing to batch rapid changes
    syncTimerRef.current = setTimeout(() => {
      // Deep equality check to prevent infinite loop
      if (lastSyncedCartRef.current === cartHash) {
        isDirtyRef.current = false;
        return;
      }

      if (!isDirtyRef.current) {
        return;
      }

      isSyncInFlightRef.current = true;
      lastAttemptedCartHashRef.current = cartHash;
      // Optimistically clear dirty so derived updates don't keep scheduling the same PATCH.
      // If the request fails we mark it dirty again in catch.
      isDirtyRef.current = false;

      syncCountRef.current += 1;

      // Log what changed - with safe JSON parsing
      if (lastSyncedCartRef.current && cartHash) {
        try {
          // Validate that both are valid JSON strings
          if (
            typeof lastSyncedCartRef.current === "string" &&
            typeof cartHash === "string" &&
            lastSyncedCartRef.current &&
            cartHash
          ) {
            let oldCart, newCart;
            try {
              oldCart = JSON.parse(lastSyncedCartRef.current);
              newCart = JSON.parse(cartHash);
            } catch (parseError) {
              oldCart = { items: [], price: {}, checkout: {} };
              newCart = { items: [], price: {}, checkout: {} };
            }

            // Safe access with fallbacks
            const oldItems = Array.isArray(oldCart?.items) ? oldCart.items : [];
            const newItems = Array.isArray(newCart?.items) ? newCart.items : [];
          } else {
          }
        } catch (parseError) {}
      } else {
      }

      if (!cartPayloadForSync) {
        isSyncInFlightRef.current = false;
        return;
      }

      // Ensure customer ID is included in the actual API call
      const cartWithCustomer = {
        ...cartPayloadForSync,
        customer: customerId ?? undefined,
      };
      updateCart({
        cartId: cartId || "",
        data: cartWithCustomer,
      })
        .then(() => {
          lastSyncedCartRef.current = cartHash;
        })
        .catch((err) => {
          isDirtyRef.current = true;
        })
        .finally(() => {
          isSyncInFlightRef.current = false;
        });
    }, 500);

    // Cleanup function
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [cartHash, apiCalled, isUserLoggedIn, userLoggedIn, cartId, dontSaveToDB]);

  // ERASE DATA LOCALLY WHEN USER IS LOGGING OUT ------------------------------------
  useEffect(() => {
    try {
      if (isUserLoggedIn && !userLoggedIn) {
        setUserLoggedIn(true);
      } else if (!isUserLoggedIn && userLoggedIn) {
        // user is logging out
        try {
          setTheCart(DEFAULT_CART_DOCUMENT);
          clearAllCartData();
        } catch (error) {
          // Safe fallback
          try {
            if (typeof window !== "undefined" && window.localStorage) {
              localStorage.clear();
            }
          } catch (e) {
            // Silent fail
          }
        }
      }
    } catch (error) {}
  }, [isUserLoggedIn]);

  // CHECK IF CHECKOUT DETAILS IS ENTIRELY COMPLETE -------------------------------------------------
  useEffect(() => {
    try {
      // Safety check: ensure component is properly initialized
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
      }

      // Safety check: ensure setIsCheckoutComplete is available
      if (
        !setIsCheckoutComplete ||
        typeof setIsCheckoutComplete !== "function"
      ) {
        return;
      }

      // Safe setState wrapper
      const safeSetCheckoutComplete = (newState: {
        status: boolean;
        message: string;
      }) => {
        try {
          if (
            setIsCheckoutComplete &&
            typeof setIsCheckoutComplete === "function"
          ) {
            setIsCheckoutComplete(newState);
          }
        } catch (error) {}
      };

      const { checkout } = theCart;

      // Add comprehensive safety checks
      if (!checkout || !checkout.contact || !checkout.location) {
        safeSetCheckoutComplete({
          status: false,
          message: "Checkout information is incomplete",
        });
        return;
      }

      let msg = "";

      // Safe string validation helper
      const isValidString = (str: any): boolean => {
        try {
          return str && typeof str === "string" && str.trim();
        } catch (error) {
          return false;
        }
      };

      if (!isValidString(checkout.name)) {
        msg = "Name is not filled";
      } else if (
        !isValidString(checkout.contact?.mail) ||
        !REGEX_TEST?.EMAIL?.test(checkout.contact?.mail || "")
      ) {
        msg = "Email is not complete or valid";
      } else if (
        !isValidString(checkout.contact?.mobileNumber) ||
        !REGEX_TEST?.MOBILE?.test(checkout.contact?.mobileNumber || "")
      ) {
        msg = "Mobile no. is not complete or valid";
      } else if (!isValidString(checkout.location?.address)) {
        msg = "Address is not filled";
      } else if (checkout.deliverToSomeoneElse) {
        if (!isValidString(checkout.receiverName)) {
          msg = "Receiver Name is needed";
        } else if (!isValidString(checkout.receiverMobileNumber)) {
          msg = "Receiver Mobile is needed";
        }
      }

      safeSetCheckoutComplete({
        message: msg,
        status: !msg,
      });
    } catch (error) {
      // Last resort: try to set a safe state
      try {
        if (
          setIsCheckoutComplete &&
          typeof setIsCheckoutComplete === "function"
        ) {
          setIsCheckoutComplete({
            status: false,
            message: "System error during validation",
          });
        }
      } catch (finalError) {}
    }
  }, [theCart.checkout]);

  // useEffect(() => {

  // }, [isCheckoutComplete]);

  // SET CUSTOMER ID INTO CART DOCUMENT -------------------------------------------------
  useEffect(() => {
    if (isReady && customerId && customerId) {
      isCustomerAssigningRef.current = true;
      setTheCart((prev) => ({ ...prev, customer: customerId }) as CartDocument);
      // Reset the flag after a short delay to allow the state to settle
      setTimeout(() => {
        isCustomerAssigningRef.current = false;
      }, 1000);
    }
  }, [isReady, customerId]);

  useEffect(() => {
    if (customerDetailsFromContext) {
      const { name, mail, mobileNumber } = customerDetailsFromContext;
      const defaultAddress =
        addresses.find(({ isDefault }) => isDefault) || addresses[0];

      setTheCart((prev) => {
        if (!prev) return prev;

        // Check if values actually need updating to prevent infinite loop
        const currentCheckout = prev.checkout;
        const mobileToUpdate = mobileNumber?.includes("-")
          ? mobileNumber.split("-")[1] || mobileNumber
          : mobileNumber;

        const needsUpdate =
          (currentCheckout?.name !== name && !currentCheckout?.name) ||
          (currentCheckout?.contact?.mail !== mail &&
            !currentCheckout?.contact?.mail) ||
          (currentCheckout?.contact?.mobileNumber !== mobileToUpdate &&
            !currentCheckout?.contact?.mobileNumber) ||
          (!currentCheckout?.location?.address && defaultAddress?.address);

        if (!needsUpdate) return prev;

        return {
          ...prev,
          checkout: prev.checkout
            ? ({
                ...prev.checkout,
                name:
                  prev.checkout.name && prev.checkout.name
                    ? prev.checkout.name
                    : name,
                contact: {
                  ...prev.checkout.contact,
                  mobileNumber:
                    prev.checkout.contact.mobileNumber &&
                    prev.checkout.contact.mobileNumber
                      ? prev.checkout.contact.mobileNumber
                      : mobileToUpdate,
                  mail:
                    prev.checkout.contact.mail && prev.checkout.contact.mail
                      ? prev.checkout.contact.mail
                      : mail,
                },
              } as CartCheckoutDocument)
            : ({
                name,
                contact: {
                  mobileNumber: mobileToUpdate,
                  mail,
                },
                location: {
                  address: defaultAddress ? defaultAddress.address : "",
                  city: "",
                  pincode: "",
                },
              } as CartCheckoutDocument),
        } as CartDocument;
      });
    }
  }, [customerDetailsFromContext, addresses]);

  // useEffect(() => {
  //   if (selectedPincode && selectedPincode !== null) {
  //     try {
  //       setTheCart(
  //         (prev) =>
  //           ({
  //             ...prev,
  //             checkout: prev.checkout
  //               ? {
  //                 ...prev.checkout,
  //                 location: {
  //                   ...prev.checkout.location,
  //                   city:
  //                     (
  //                       (selectedPincode as any)
  //                         ?.city as any
  //                     )?.name || "",
  //                   pincode: `${(selectedPincode as any)?.code || ""}`
  //                 }
  //               }
  //               : prev
  //           }) as CartDocument
  //       );
  //     } catch (error) {

  //     }
  //   }
  // }, [selectedPincode]);

  useEffect(() => {
    if (!theCart.checkout) {
      updateMasterCartDeliveryDetails(
        {
          address: addresses?.find(({ isDefault }) => isDefault)?.address || "",
          city: addresses?.find(({ isDefault }) => isDefault)?.city || "",
          email: customerDetailsFromContext?.mail || "",
          mobile: customerDetailsFromContext?.mobileNumber?.includes("-")
            ? customerDetailsFromContext.mobileNumber.split("-")[1] || ""
            : customerDetailsFromContext?.mobileNumber || "",
          name: customerDetailsFromContext?.name || "",
          occasion: "",
          pincode: "",
          type: "default",
        } as DeliveryDetailsType,
        { silent: true },
      );
    }
  }, [theCart.checkout]);

  return (
    <Cart.Provider
      value={{
        data: {
          items: extractCartItems({
            cart: theCart,
            selectedCity,
          }),
          itemDetails: extractCartDetails(theCart),
          price: extractPrice(theCart),
          deliveryDetails: (() => {
            try {
              return extractDeliveryDetails(theCart);
            } catch (error: any) {
              return {
                address: "",
                city: "",
                email: "",
                mobile: "",
                occasion: "",
                pincode: "",
                type: "default" as const,
                name: "",
              };
            }
          })(),
          appliedCoupon: extractAppliedCoupon(theCart),
          allCoupons: filterRelevantCoupons({
            allCoupons,
            itemsInCart: theCart.items,
          }),
          partialPercentage: getPartialPercentage(theCart.items),
          occasions: allOccasions,
          isCheckoutComplete,
        },
        addToCartFunctions: {
          addItem: addItemToCart,
        },
        cartFunctions: {
          updateCartContext: {
            updateDeliveryDetails: updateMasterCartDeliveryDetails,
            updateItems: updateMasterCartItems,
            updatePaymentPercentage: updateMasterCartPaymentPercentage,
            updateSelectedCoupon: updateMasterCartAppliedCoupon,
          },
          clearCart: clearAllCartData,
        },
      }}
    >
      {children}
    </Cart.Provider>
  );
}

export const useCart = (): Cart => {
  const cart = useContext(Cart);

  if (!cart) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return cart;
};
