"use client";

// constants
import { initialCartPrice } from "./constants/initialCartPrice";

// requests
import { addCart, fetchCart, updateCart } from "@/request/dynamic/cart";

// utils
import { createContext, useContext } from "react";
import { calculateCartPrice } from "./utils/calculateCartPrice";
import { validateCartItems } from "./utils/validateCartItems";

// hooks
import { useEffect, useState } from "react";
import { useAppStates } from "../useAppState/useAppState";
import { useCustomerProfile } from "../useCustomerProfile";

// types
import { type AdvancePaymentDocument } from "@/common/types/documentation/presets/advancePayment";
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";
import { type CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";
import { type CartCheckoutContactDocument } from "@/common/types/documentation/nestedDocuments/cartCheckoutContact";
import { type CartCheckoutLocationDocument } from "@/common/types/documentation/nestedDocuments/cartCheckoutLocation";
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CartPriceDocument } from "@/common/types/documentation/nestedDocuments/cartPrice";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";
import { type CustomerAddressDocument } from "@/common/types/documentation/nestedDocuments/customerAddress";
import { type CustomerDetail } from "../useAppState/types/profile";
import { type ReactNode } from "react";

// declarations
// constants
const SHOW_LOGS = false;

// types
type Cart = {
  isReady: boolean;
  items: CartItemDocument[];
  price: CartPriceDocument;
  savingAmount: number;
  maxPaymentPercentage: number;
  checkout: CartCheckoutDocument | null;
  coupon: CouponDocument | null;
  onCreateCart: () => void;
  onChangeItems: (items: CartItemDocument[]) => void;
  onChangePaymentPercentage: (paymentPercentage: number) => void;
  onChangeCheckout: (checkout: CartCheckoutDocument | null) => void;
  onChangeCoupon: (coupon: CouponDocument | null) => void;
};

// context
const Cart = createContext<Cart | null>(null);

// exports
export function CartProvider({ children }: { children: ReactNode }) {
  // hooks
  const {
    isReady: isLocalReady,
    isOrdered,
    location: {
      data: { selectedCity }
    },
    auth: {
      data: { isAuthenticated, customerId }
    },
    profile: {
      data: { detail, addresses, cartId: profileCartId }
    },
    cart: {
      data: { cart },
      method: { onChangeCart: setCart }
    }
  } = useAppStates();
  const {
    isReady: isProfileReady,
    address: { onAdd: onAddAddress },
    detail: { onChange: onChangeCustomerDetail },
    cart: { onAdd: onChangeCustomerCartId }
  } = useCustomerProfile();

  // states
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // status states
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isCloudReady, setIsCloudReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // data states
  // data states: id
  const [id, setId] = useState<string>("");

  // data states: items
  const [items, setItems] = useState<CartItemDocument[]>([]);
  const [itemsLocal, setItemsLocal] = useState<CartItemDocument[]>([]);
  const [itemsCloud, setItemsCloud] = useState<CartItemDocument[]>([]);
  const [itemsLocalJSON, setItemsLocalJSON] = useState<string>("[]");
  const [itemsCloudJSON, setItemsCloudJSON] = useState<string>("[]");

  // data states: price
  const [paymentPercentage, setPaymentPercentage] = useState<number>(100);
  const [price, setPrice] = useState<CartPriceDocument>(initialCartPrice);

  // data states: checkout
  const [checkout, setCheckout] = useState<CartCheckoutDocument | null>(null);
  const [checkoutCloud, setCheckoutCloud] =
    useState<CartCheckoutDocument | null>(null);

  // data states: coupon
  const [coupon, setCoupon] = useState<CouponDocument | null>(null);

  // variables - with safe null checks for mobile
  const savingAmount =
    (items && Array.isArray(items) ? items.reduce((total, item) => {
      try {
        if (!item || !item.content || !item.quantity) return total;
        const content = item.content as ContentDocument;
        const { mrp, price: itemPrice } =
          content?.price?.cities?.find(
            ({ city }) => String(city) === String(selectedCity?._id)
          ) || content?.price?.base || { mrp: 0, price: 0 };

        return total + (mrp ? (mrp - itemPrice) * item.quantity : 0);
      } catch (error) {
        return total;
      }
    }, 0) : 0) + (price?.couponDiscount || 0);
  
  const maxPaymentPercentage =
    items && Array.isArray(items) ? items.reduce((max, item) => {
      try {
        if (!item || !item.content) return max;
        const contentDoc = item.content as ContentDocument;

        return Math.max(
          (
            (contentDoc?.category?.primary as ContentCategoryDocument)?.charges
              ?.advancePayment as AdvancePaymentDocument
          )?.value || 100,
          max
        );
      } catch (error) {
        return max;
      }
    }, 0) : 100;

  // event handlers
  const handleInitialLoad = async () => {
    try {
      if (SHOW_LOGS) {
      }

      if (cart) {
        if (cart.items && Array.isArray(cart.items) && cart.items.length) {
          setItemsLocal(validateCartItems({ items: cart.items, selectedCity }));
        }

        if (
          cart?.price?.paymentPercentage &&
          cart.price.paymentPercentage !== 100
        ) {
          setPaymentPercentage(cart.price.paymentPercentage);
        }

        if (
          cart.checkout &&
          cart.checkout?.name &&
          cart.checkout?.contact?.mobileNumber &&
          cart.checkout?.contact?.mail &&
          cart.checkout?.location?.address &&
          cart.checkout?.location?.city &&
          cart.checkout?.location?.pincode
        ) {
          setCheckout(cart.checkout);
        }

        if (cart.coupon) {
          setCoupon(cart.coupon as CouponDocument);
        }
      }

      setIsReady(true);
    } catch (error) {
      // Set ready anyway to prevent infinite loading
      setIsReady(true);
    }
  };

  const handleChangePaymentPercentage = (paymentPercentage: number) => {
    setPaymentPercentage(paymentPercentage);

    if (paymentPercentage !== 100) {
      setCoupon(null);
    }
  };

  const handleCreateCart = () => {
    setIsLoading(true);

    addCart({
      customer: customerId,
      items,
      price,
      ...(checkout ? { checkout } : {})
    } as CartDocument)
      .then(({ data: newCart }) => {
        if (newCart) {
          setId(String(newCart._id));
          onChangeCustomerCartId(String(newCart._id));

          if (checkout) {
            setCheckoutCloud(checkout);
          }

          if (!isCloudReady) {
            setIsCloudReady(true);
          }

          setIsLoading(false);

          if (SHOW_LOGS) {
          }
        }
      })
      .catch((error) => {});
  };

  // side effects
  // side effects: onMount
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // status states
  useEffect(() => {
    if (isMounted) {
      if (SHOW_LOGS) {
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (SHOW_LOGS) {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  useEffect(() => {
    if (isMounted) {
      if (SHOW_LOGS) {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // JSON
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      setItemsLocalJSON(JSON.stringify(itemsLocal));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsLocal]);

  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      setItemsCloudJSON(JSON.stringify(itemsCloud));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsCloud]);

  // initialize
  useEffect(() => {
    if (isMounted) {
      (async () => {
        if (SHOW_LOGS) {
        }

        if (isLocalReady) {
          await handleInitialLoad();
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isLocalReady]);

  // id
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // items
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      if (JSON.stringify(items) !== itemsLocalJSON) {
        setItemsLocal(items);
      }

      if (JSON.stringify(items) !== itemsCloudJSON) {
        setItemsCloud(items);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      if (itemsLocalJSON !== JSON.stringify(items)) {
        setItems(validateCartItems({ selectedCity, items: itemsLocal }));
      }

      if (itemsLocalJSON !== JSON.stringify(cart?.items)) {
        setCart({
          ...cart,
          items: itemsLocal
        } as CartDocument);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsLocalJSON]);

  // price
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      const newPrice = calculateCartPrice({ items, paymentPercentage, coupon });

      setPrice(newPrice);

      if (coupon && !newPrice.couponDiscount) {
        setCoupon(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, paymentPercentage, coupon]);

  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      setCart({
        ...cart,
        price
      } as CartDocument);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  // checkout
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      if (
        checkout &&
        (!detail?.name ||
          detail.name === "User" ||
          !detail.mobileNumber ||
          !detail.mail)
      ) {
        onChangeCustomerDetail({
          ...detail,
          ...((!detail?.name || detail.name === "User") && checkout.name
            ? { name: checkout.name }
            : {}),
          ...(!detail?.mobileNumber && checkout?.contact?.mobileNumber
            ? {
                mobileNumber: checkout.contact.mobileNumber
              }
            : {}),
          ...(!detail?.mail && checkout?.contact?.mail
            ? {
                mail: checkout.contact.mail
              }
            : {})
        } as CustomerDetail);
      }

      if (checkout && checkout?.location && !addresses?.length) {
        if (checkout.location.address && checkout.location.city && checkout.location.pincode) {
          onAddAddress({
            address: checkout.location.address,
            city: checkout.location.city,
            pincode: checkout.location.pincode,
            type: "Default",
            isDefault: true
          } as CustomerAddressDocument);
        }
      }

      setCart({
        ...cart,
        checkout
      } as CartDocument);

      if (checkout) {
        const activeId = id || profileCartId;
        if (activeId) {
          updateCart(activeId, {
            items,
            price,
            checkout
          } as CartDocument)
            .then(({ data: updatedCart }) => {
              if (updatedCart) {
                setCheckoutCloud(checkout);
                setIsCloudReady(true);
              }
            })
            .catch((error) => {
              console.error("[useCart] updateCart error:", error);
            });
        } else {
          addCart({
            customer: customerId || undefined,
            items,
            price,
            checkout
          } as CartDocument)
            .then(({ data: newCart }) => {
              if (newCart) {
                const newId = String(newCart._id);
                setId(newId);
                onChangeCustomerCartId(newId);
                setCheckoutCloud(checkout);
                setIsCloudReady(true);
              }
            })
            .catch((error) => {
              console.error("[useCart] addCart error:", error);
            });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, items, price, id, profileCartId, customerId]);

  // coupon
  useEffect(() => {
    if (isReady) {
      if (SHOW_LOGS) {
      }

      setCart({
        ...cart,
        coupon
      } as CartDocument);

      if (isCloudReady && id && id !== "undefined") {
        if (!isLoading) {
          setIsLoading(true);

          updateCart(id, {
            items,
            price: calculateCartPrice({ items, paymentPercentage, coupon }),
            ...(checkout ? { checkout } : { $unset: { checkout: 1 } }),
            ...(coupon ? { coupon } : { $unset: { coupon: 1 } })
          } as CartDocument)
            .then(() => {
            })
            .catch((error) => {
            })
            .finally(() => {
              setIsLoading(false);
            });

          setCheckoutCloud(checkout);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon]);

  // cloud
  useEffect(() => {
    if (isReady && !isOrdered && isProfileReady) {
      if (SHOW_LOGS) {
      }

      if (isAuthenticated && customerId) {
        if (profileCartId) {
          if (!isLoading) {
            setIsLoading(true);

            fetchCart(profileCartId)
              .then(({ data: cart }) => {
                if (cart) {
                  setId(profileCartId);
                  onChangeCustomerCartId(profileCartId);

                  const newItems = validateCartItems({
                    selectedCity,
                    items: [...(itemsLocal ? itemsLocal : []), ...cart.items!]
                  });

                  if (JSON.stringify(newItems) !== JSON.stringify(items)) {
                    setItems(newItems);
                  }

                  if (cart.checkout) {
                    setCheckoutCloud(cart.checkout);

                    if (
                      JSON.stringify(cart.checkout) !== JSON.stringify(checkout)
                    ) {
                      setCheckout(cart.checkout);
                    }
                  }

                  setIsCloudReady(true);

                  setIsLoading(false);

                  if (SHOW_LOGS) {
                  }
                }
              })
              .catch((error) => {
                

                addCart({
                  customer: customerId,
                  items,
                  price,
                  ...(checkout ? { checkout } : {})
                } as CartDocument)
                  .then(({ data: newCart }) => {
                    if (newCart) {
                      setId(String(newCart._id));
                      onChangeCustomerCartId(String(newCart._id));

                      if (checkout) {
                        setCheckoutCloud(checkout);
                      }

                      setIsCloudReady(true);

                      setIsLoading(false);

                      if (SHOW_LOGS) {
                      }
                    }
                  })
                  .catch((error) => {
                    addCart({
                      customer: customerId,
                      items,
                      price,
                      ...(checkout ? { checkout } : {})
                    } as CartDocument)
                      .then(({ data: newCart }) => {
                        if (newCart) {
                          setId(String(newCart._id));
                          onChangeCustomerCartId(String(newCart._id));

                          if (checkout) {
                            setCheckoutCloud(checkout);
                          }

                          setIsCloudReady(true);

                          setIsLoading(false);

                          if (SHOW_LOGS) {
                          }
                        }
                      })
                      .catch((error) => {
                        
                      });
                  });
              });
          }
        } else {
          if (!isLoading) {
            setIsLoading(true);

            addCart({
              customer: customerId,
              items,
              price,
              ...(checkout ? { checkout } : {})
            } as CartDocument)
              .then(({ data: newCart }) => {
                if (newCart) {
                  setId(String(newCart._id));
                  onChangeCustomerCartId(String(newCart._id));

                  if (checkout) {
                    setCheckoutCloud(checkout);
                  }

                  setIsCloudReady(true);

                  setIsLoading(false);

                  if (SHOW_LOGS) {
                  }
                }
              })
              .catch((error) => {
                addCart({
                  customer: customerId,
                  items,
                  price,
                  ...(checkout ? { checkout } : {})
                } as CartDocument)
                  .then(({ data: newCart }) => {
                    if (newCart) {
                      setId(String(newCart._id));
                      onChangeCustomerCartId(String(newCart._id));

                      if (checkout) {
                        setCheckoutCloud(checkout);
                      }

                      setIsCloudReady(true);

                      setIsLoading(false);

                      if (SHOW_LOGS) {
                      }
                    }
                  })
                  .catch((error) => {
                  });
              });
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isProfileReady, isAuthenticated]);

  useEffect(() => {
    if (isReady && !isOrdered) {
      if (SHOW_LOGS) {
      }

      if (isCloudReady && !isOrdered && id && id !== "undefined") {
        if (!isLoading) {
          setIsLoading(true);

          updateCart(id, {
            items,
            price,
            ...(checkout ? { checkout } : { $unset: { checkout: 1 } }),
            ...(coupon ? { coupon } : { $unset: { coupon: 1 } })
          } as CartDocument)
            .then(() => {
              if (SHOW_LOGS) {
              }
            })
            .catch((error) => {
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloudReady, itemsCloudJSON]);

  useEffect(() => {
    if (isReady && !isOrdered) {
      if (SHOW_LOGS) {
      }

      if (isCloudReady && !isOrdered && id && id !== "undefined") {
        if (!isLoading) {
          setIsLoading(true);

          updateCart(id, {
            items,
            ...(price.paymentPercentage === paymentPercentage
              ? { price }
              : {
                  price: calculateCartPrice({
                    items,
                    paymentPercentage,
                    coupon
                  })
                }),
            ...(checkout ? { checkout } : { $unset: { checkout: 1 } }),
            ...(coupon ? { coupon } : { $unset: { coupon: 1 } })
          } as CartDocument)
            .then(() => {
              if (SHOW_LOGS) {
              }
            })
            .catch((error) => {
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentPercentage]);

  // Sync selectedCity from product page/header into checkout
  useEffect(() => {
    if (isReady && selectedCity?.name) {
      setCheckout((prev) => {
        if (prev?.location?.city === selectedCity.name) return prev;
        return {
          ...(prev || {}),
          location: {
            ...(prev?.location || {}),
            city: selectedCity.name
          }
        } as CartCheckoutDocument;
      });
    }
  }, [isReady, selectedCity?.name]);

  useEffect(() => {
    if (isReady && isProfileReady) {
      if (SHOW_LOGS) {
      }

      if (!checkout) {
        if (
          detail?.name &&
          detail?.mobileNumber &&
          detail?.mail &&
          addresses?.length
        ) {
          const defaultAddress = addresses.find(
            ({ isDefault }) => isDefault
          ) as CustomerAddressDocument;

          setCheckout({
            name: detail.name,
            contact: {
              mobileNumber: detail.mobileNumber,
              mail: detail.mail
            } as CartCheckoutContactDocument,
            location: {
              address: defaultAddress.address,
              city: selectedCity?.name || defaultAddress.city,
              pincode: defaultAddress.pincode
            } as CartCheckoutLocationDocument
          } as CartCheckoutDocument);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isProfileReady, selectedCity?.name]);

  // order
  useEffect(() => {
    if (isReady && isOrdered) {
      if (SHOW_LOGS) {
      }

      setId("");
      setItems([]);
      setPaymentPercentage(100);
      setCheckout(null);
      setCheckoutCloud(null);
      setCoupon(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrdered]);

  return (
    <Cart.Provider
      value={{
        isReady,
        items,
        price,
        savingAmount,
        maxPaymentPercentage,
        checkout,
        coupon,
        onCreateCart: handleCreateCart,
        onChangeItems: setItems,
        onChangeCoupon: setCoupon,
        onChangePaymentPercentage: handleChangePaymentPercentage,
        onChangeCheckout: setCheckout
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
