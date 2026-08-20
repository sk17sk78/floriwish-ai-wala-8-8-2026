// icons
import {
  Eye,
  Gift,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  PartyPopper,
  Phone,
  Send,
  UserCheck,
  UserRound
} from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";

// hooks
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "@/store/withType";

// redux
import {
  createCartAction,
  selectCart
} from "@/store/features/dynamic/cartSlice";
import {
  createCustomerAction,
  selectCustomer
} from "@/store/features/users/customerSlice";
import {
  createOccasionAction,
  selectOccasion
} from "@/store/features/presets/occasionSlice";
import {
  createCityAction,
  selectCity
} from "@/store/features/presets/citySlice";

// requests
import { fetchCart } from "@/request/dynamic/cart";

// types
import { type CartDocument } from "@/common/types/documentation/dynamic/cart";

// components
import CartItem from "./CartItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  generateWhatsAppCartMessage,
  openWhatsAppCart
} from "../utils/generateWhatsAppCartMessage";

// Official WhatsApp Icon SVG
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.31 19.8 8.11 19.09L7.83 18.92L4.71 19.74L5.54 16.7L5.35 16.4C4.55 15.13 4.12 13.56 4.12 11.92C4.12 7.38 7.82 3.67 12.05 3.67ZM8.83 7.37C8.65 7.37 8.35 7.44 8.1 7.71C7.85 7.98 7.15 8.64 7.15 9.98C7.15 11.32 8.13 12.61 8.26 12.79C8.4 12.97 10.18 15.72 12.9 16.89C13.55 17.17 14.05 17.33 14.45 17.46C15.1 17.67 15.69 17.64 16.15 17.57C16.67 17.49 17.75 16.92 17.98 16.28C18.2 15.64 18.2 15.09 18.13 14.98C18.06 14.87 17.89 14.8 17.62 14.66C17.35 14.53 16.03 13.88 15.78 13.79C15.54 13.7 15.36 13.65 15.19 13.92C15.01 14.19 14.51 14.78 14.36 14.95C14.21 15.13 14.06 15.15 13.79 15.01C13.53 14.88 12.68 14.6 11.67 13.7C10.89 13 10.36 12.14 10.21 11.89C10.06 11.64 10.19 11.51 10.33 11.37C10.45 11.25 10.59 11.07 10.73 10.91C10.86 10.75 10.91 10.63 11 10.45C11.09 10.27 11.05 10.12 10.98 9.98C10.91 9.85 10.38 8.54 10.16 8.01C9.94 7.49 9.72 7.56 9.56 7.55C9.41 7.55 9.23 7.54 9.06 7.54C8.88 7.54 8.83 7.37 8.83 7.37Z" />
    </svg>
  );
}

export default function CartDetails({ cartId }: { cartId: string }) {
  const dispatch = useDispatch();

  const [open, setOpen] = useState<boolean>(false);
  const [liveCart, setLiveCart] = useState<CartDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // redux states
  const cartStatus = useSelector(selectCart.status);
  const { documents: carts } = useSelector(selectCart.documentList);

  const customerStatus = useSelector(selectCustomer.status);
  const { documents: customers } = useSelector(selectCustomer.documentList);

  const occasionStatus = useSelector(selectOccasion.status);
  const { documents: occasions } = useSelector(selectOccasion.documentList);

  const cityStatus = useSelector(selectCity.status);
  const { documents: cities } = useSelector(selectCity.documentList);

  // Fetch populated cart data whenever modal opens
  useEffect(() => {
    if (open && cartId) {
      setIsLoading(true);
      fetchCart(cartId)
        .then(({ data }) => {
          if (data) {
            setLiveCart(data as CartDocument);
          }
        })
        .catch((err) => {
          console.error("[CartDetails] fetchCart error:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, cartId]);

  // Variables
  const cart = liveCart || carts.find(({ _id }) => String(_id) === String(cartId));
  const cartItems = cart?.items || [];

  const customer =
    customers.find(
      ({ _id }) =>
        String(_id) === String(cart?.customer) ||
        String(_id) === String((cart?.customer as any)?._id)
    ) ||
    customers.find(
      (c) =>
        (c.mail &&
          cart?.checkout?.contact?.mail &&
          c.mail.toLowerCase() === cart.checkout.contact.mail.toLowerCase()) ||
        (c.name &&
          cart?.checkout?.name &&
          c.name.toLowerCase() === cart.checkout.name.toLowerCase())
    );

  const fallbackCustomerWithAddress = customers.find(
    (c) =>
      c.addresses?.length > 0 &&
      ((customer?.mail && c.mail?.toLowerCase() === customer.mail.toLowerCase()) ||
        (customer?.mobileNumber &&
          c.mobileNumber &&
          c.mobileNumber === customer.mobileNumber) ||
        (customer?.name &&
          c.name?.toLowerCase() === customer.name.toLowerCase()))
  );

  const defaultAddress =
    customer?.addresses?.find((addr) => addr.isDefault) ||
    customer?.addresses?.[0] ||
    fallbackCustomerWithAddress?.addresses?.find((addr) => addr.isDefault) ||
    fallbackCustomerWithAddress?.addresses?.[0];

  // Resolve Customer Details
  const customerName =
    cart?.checkout?.name ||
    customer?.name ||
    (customer as any)?.createdBy ||
    fallbackCustomerWithAddress?.name ||
    "";
  const customerMobile =
    cart?.checkout?.contact?.mobileNumber ||
    customer?.mobileNumber ||
    fallbackCustomerWithAddress?.mobileNumber ||
    "";
  const customerEmail =
    cart?.checkout?.contact?.mail ||
    customer?.mail ||
    fallbackCustomerWithAddress?.mail ||
    "-";

  // Resolve Delivery Location
  const addressText =
    cart?.checkout?.location?.address ||
    defaultAddress?.address ||
    cartItems.find((i) => i.instruction)?.instruction ||
    "";
  const landmarkText =
    cart?.checkout?.location?.landmark || defaultAddress?.landmark || "";

  const rawCity =
    cart?.checkout?.location?.city ||
    (cart?.checkout as any)?.city ||
    defaultAddress?.city ||
    "";
  const rawPincode =
    cart?.checkout?.location?.pincode || defaultAddress?.pincode || "";

  // Resolve city name cleanly
  let cityDisplay = "";
  if (rawCity) {
    const cityDoc = cities.find(
      ({ _id, name }) =>
        String(_id) === String(rawCity) ||
        name?.toLowerCase() === String(rawCity).toLowerCase() ||
        (typeof rawCity === "object" &&
          rawCity !== null &&
          String(_id) === String((rawCity as any)._id))
    );
    if (cityDoc && cityDoc.name) {
      cityDisplay = cityDoc.name;
    } else if (typeof rawCity === "string" && rawCity.trim()) {
      cityDisplay = rawCity.trim();
    } else if (
      typeof rawCity === "object" &&
      rawCity !== null &&
      (rawCity as any).name
    ) {
      cityDisplay = (rawCity as any).name;
    }
  }

  // Resolve Occasion
  const occasionDoc = occasions.find(
    ({ _id, name }) =>
      String(_id) === String(cart?.checkout?.occasion) ||
      name?.toLowerCase() === String(cart?.checkout?.occasion).toLowerCase()
  );
  const occasionName =
    occasionDoc?.name ||
    (typeof cart?.checkout?.occasion === "string" &&
    cart.checkout.occasion.length > 2
      ? cart.checkout.occasion
      : "");

  // Receiver Info
  const isDifferentReceiver = Boolean(
    cart?.checkout?.deliverToSomeoneElse ||
      cart?.checkout?.receiverName ||
      cart?.checkout?.receiverMobileNumber
  );
  const receiverName = cart?.checkout?.receiverName || "";
  const receiverMobile = cart?.checkout?.receiverMobileNumber || "";

  // Note / Instructions
  const orderNote =
    cart?.checkout?.note ||
    cartItems.find((i) => i.instruction)?.instruction ||
    "";

  // Redux auto-fetch
  useEffect(() => {
    if (cartStatus === "idle") {
      dispatch(createCartAction.fetchDocumentList());
    }
  }, [cartStatus, dispatch]);

  useEffect(() => {
    if (customerStatus === "idle") {
      dispatch(createCustomerAction.fetchDocumentList());
    }
  }, [customerStatus, dispatch]);

  useEffect(() => {
    if (occasionStatus === "idle") {
      dispatch(createOccasionAction.fetchDocumentList());
    }
  }, [occasionStatus, dispatch]);

  useEffect(() => {
    if (cityStatus === "idle") {
      dispatch(createCityAction.fetchDocumentList());
    }
  }, [cityStatus, dispatch]);

  // Handler to send cart details to WhatsApp
  const handleSendWhatsApp = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      if (!cart) return;

      const targetPhone =
        customerMobile ||
        cart?.checkout?.contact?.mobileNumber ||
        receiverMobile ||
        "";

      const message = generateWhatsAppCartMessage({
        cart,
        customerName: customerName || receiverName,
        customerMobile: targetPhone,
        cityDisplay,
        addressText
      });

      if (!targetPhone || targetPhone === "-") {
        const manualPhone = window.prompt(
          "Customer phone number was not found. Please enter 10-digit phone number to send WhatsApp message:",
          ""
        );
        if (manualPhone) {
          openWhatsAppCart({ phone: manualPhone, message });
        } else {
          openWhatsAppCart({ phone: "", message });
        }
        return;
      }

      openWhatsAppCart({ phone: targetPhone, message });
    },
    [cart, customerMobile, receiverMobile, customerName, receiverName, cityDisplay, addressText]
  );

  if (cart === undefined) {
    return <span className="text-sm text-zinc-400">-</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Eye Icon to View Cart Modal */}
      <button
        type="button"
        title="View Cart Items"
        onClick={() => setOpen(true)}
        className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
      >
        <Eye strokeWidth={1.8} width={16} height={16} />
      </button>

      {/* 2. WhatsApp Icon to Send Cart Directly to Customer */}
      <button
        type="button"
        title={
          customerMobile && customerMobile !== "-"
            ? `Send Cart to WhatsApp (${customerMobile})`
            : "Send Cart on WhatsApp"
        }
        onClick={handleSendWhatsApp}
        className="p-1.5 text-[#25D366] hover:text-[#1eb857] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
      >
        <WhatsAppIcon className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-4 pb-0 sm:py-6 sm:px-8 outline-none border-none bg-white rounded-3xl grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] max-sm:w-device max-sm:h-device sm:min-w-[calc(85dvw_+_40px)] max-sm:gap-y-6 sm:gap-x-8 sm:h-[92dvh] max-sm:overflow-auto shadow-2xl">
          <DialogHeader className="hidden">
            <DialogTitle>Cart Details</DialogTitle>
          </DialogHeader>

          {/* LEFT COLUMN: CART ITEMS ------------------------------------ */}
          <section className="flex flex-col gap-4 sm:overflow-y-scroll scrollbar-hide pr-2">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  Cart Items ({cartItems.length})
                </h3>
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                  ID: {String(cart._id).slice(-8)}
                </span>
                {/* Header WhatsApp Quick Action */}
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>

            <section className="flex flex-col divide-y divide-zinc-200">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm">
                  {isLoading ? "Loading cart items..." : "No items in this cart."}
                </div>
              ) : (
                cartItems.map((cartItem, idx) => (
                  <CartItem
                    key={cartItem._id ? String(cartItem._id) : idx}
                    orderItem={cartItem}
                  />
                ))
              )}
            </section>
          </section>

          {/* RIGHT COLUMN: COMPLETE CHECKOUT DETAILS --------------------- */}
          <section className="flex flex-col gap-4 sm:overflow-y-auto scrollbar-hide py-1 pl-1">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  Checkout Details
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Customer & delivery information provided at checkout
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 text-sm">
              {/* 1. CUSTOMER / SENDER DETAILS */}
              <div className="bg-zinc-50/70 rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col gap-2">
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <UserRound size={13} className="text-zinc-500" />
                  Customer Details
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-zinc-900 text-[15px]">
                    {customerName || (
                      <span className="text-zinc-400 italic">Not provided</span>
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-600 mt-0.5">
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                      <Phone size={12} className="text-zinc-400" />
                      {customerMobile || "-"}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                      <Mail size={12} className="text-zinc-400" />
                      {customerEmail}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. DELIVERY ADDRESS & LOCATION */}
              <div className="bg-zinc-50/70 rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col gap-2">
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-zinc-500" />
                  Delivery Address
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-800 font-medium leading-relaxed whitespace-pre-line text-[13px]">
                    {addressText || (
                      <span className="text-zinc-400 italic">
                        No address provided
                      </span>
                    )}
                  </span>

                  <div className="text-xs text-zinc-600 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-500">
                      Landmark:
                    </span>
                    <span
                      className={
                        landmarkText
                          ? "text-zinc-800 font-medium"
                          : "text-zinc-400 italic"
                      }
                    >
                      {landmarkText || "Not provided"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {cityDisplay && (
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-100">
                        City: {cityDisplay}
                      </span>
                    )}
                    {rawPincode && (
                      <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-xs font-semibold">
                        Pincode: {rawPincode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. RECEIVER INFO (DELIVER TO SOMEONE ELSE) */}
              <div
                className={`rounded-2xl p-4 border shadow-xs flex flex-col gap-2 ${
                  isDifferentReceiver
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-zinc-50/70 border-zinc-200/80"
                }`}
              >
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <UserCheck
                    size={13}
                    className={
                      isDifferentReceiver ? "text-amber-600" : "text-zinc-500"
                    }
                  />
                  Receiver Information
                </span>
                {isDifferentReceiver ? (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-zinc-900 text-sm">
                      {receiverName || "Receiver Name N/A"}
                    </span>
                    <span className="text-xs font-medium text-amber-800 flex items-center gap-1">
                      <Phone size={11} />
                      {receiverMobile || "Receiver Mobile N/A"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500 italic">
                    Delivering directly to customer.
                  </span>
                )}
              </div>

              {/* 4. OCCASION */}
              <div className="bg-zinc-50/70 rounded-2xl p-3.5 border border-zinc-200/80 shadow-xs flex items-center justify-between">
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <PartyPopper size={13} className="text-purple-500" />
                  Occasion
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    occasionName
                      ? "text-purple-700 bg-purple-50 border-purple-200"
                      : "text-zinc-400 bg-white border-zinc-200"
                  }`}
                >
                  {occasionName || "Not specified"}
                </span>
              </div>

              {/* 5. ORDER INSTRUCTION / NOTE */}
              {orderNote && (
                <div className="bg-zinc-50/70 rounded-2xl p-3.5 border border-zinc-200/80 shadow-xs flex flex-col gap-1.5">
                  <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <MessageSquareText size={13} className="text-blue-500" />
                    Instruction / Message
                  </span>
                  <span className="text-xs text-zinc-700 bg-white p-2.5 rounded-xl border border-zinc-200 whitespace-pre-line leading-relaxed">
                    {orderNote}
                  </span>
                </div>
              )}

              {/* 6. CART PRICE SUMMARY & WHATSAPP SEND ACTION */}
              <div className="bg-zinc-50/70 rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col gap-2.5 mt-1">
                <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                  Cart Summary
                </span>

                <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                  <span>Items Total</span>
                  <span>
                    {INRSymbol}
                    {Number(cart.price?.content || 0) +
                      Number(cart.price?.addon || 0) +
                      Number(cart.price?.customization || 0)}
                  </span>
                </div>

                {Number(cart.price?.deliveryCharge || 0) > 0 && (
                  <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                    <span>Delivery Charge</span>
                    <span>
                      {INRSymbol}
                      {cart.price.deliveryCharge}
                    </span>
                  </div>
                )}

                {Number(cart.price?.platformFee || 0) > 0 && (
                  <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                    <span>Platform Fee</span>
                    <span>
                      {INRSymbol}
                      {cart.price.platformFee}
                    </span>
                  </div>
                )}

                {Number(cart.price?.couponDiscount || 0) > 0 && (
                  <div className="flex justify-between items-center text-green-600 text-xs font-bold">
                    <span>Coupon Discount</span>
                    <span>
                      -{INRSymbol}
                      {cart.price.couponDiscount}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold text-zinc-900 text-base pt-2.5 border-t border-zinc-200">
                  <span>Total Payable</span>
                  <span>
                    {INRSymbol}
                    {cart.price?.payable ||
                      cart.price?.total ||
                      Math.round(
                        (Number(cart.price?.content || 0) +
                          Number(cart.price?.addon || 0) +
                          Number(cart.price?.customization || 0) -
                          (cart.price?.couponDiscount || 0)) *
                          (cart.price?.paymentPercentage || 100) /
                          100
                      )}
                  </span>
                </div>

                {/* Big WhatsApp Action Button in Cart Summary */}
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="mt-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>
                    Send Cart via WhatsApp{" "}
                    {customerMobile ? `(${customerMobile})` : ""}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </div>
  );
}
