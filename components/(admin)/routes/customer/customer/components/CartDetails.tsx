// icons
import {
  Eye,
  Gift,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquareText,
  PartyPopper,
  Phone,
  UserCheck,
  UserRound
} from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";

// hooks
import { useEffect, useState } from "react";
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

export default function CartDetails({ cartId }: { cartId: string }) {
  // hooks
  const dispatch = useDispatch();

  const [open, setOpen] = useState<boolean>(false);
  const [liveCart, setLiveCart] = useState<CartDocument | null>(null);

  // redux states
  const cartStatus = useSelector(selectCart.status);
  const { documents: carts } = useSelector(selectCart.documentList);

  const customerStatus = useSelector(selectCustomer.status);
  const { documents: customers } = useSelector(selectCustomer.documentList);

  const occasionStatus = useSelector(selectOccasion.status);
  const { documents: occasions } = useSelector(selectOccasion.documentList);

  const cityStatus = useSelector(selectCity.status);
  const { documents: cities } = useSelector(selectCity.documentList);

  // side effects - fetch fresh cart on open
  useEffect(() => {
    if (open && cartId) {
      fetchCart(cartId)
        .then(({ data }) => {
          if (data) {
            setLiveCart(data as CartDocument);
          }
        })
        .catch((err) => {
          console.error("[CartDetails] fetchCart error:", err);
        });
    }
  }, [open, cartId]);

  // variables
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
        (c.mail && cart?.checkout?.contact?.mail && c.mail.toLowerCase() === cart.checkout.contact.mail.toLowerCase()) ||
        (c.name && cart?.checkout?.name && c.name.toLowerCase() === cart.checkout.name.toLowerCase())
    );

  const fallbackCustomerWithAddress = customers.find(
    (c) =>
      c.addresses?.length > 0 &&
      ((customer?.mail && c.mail?.toLowerCase() === customer.mail.toLowerCase()) ||
        (customer?.mobileNumber && c.mobileNumber && c.mobileNumber === customer.mobileNumber) ||
        (customer?.name && c.name?.toLowerCase() === customer.name.toLowerCase()))
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
    "-";
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
    cart?.checkout?.location?.pincode ||
    defaultAddress?.pincode ||
    "";

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
    } else if (typeof rawCity === "object" && rawCity !== null && (rawCity as any).name) {
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
    (typeof cart?.checkout?.occasion === "string" && cart.checkout.occasion.length > 2
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

  // side effects
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

  if (cart === undefined) {
    return <span className="text-sm">Cart unavailable</span>;
  }

  return (
    <>
      <Eye
        className="cursor-pointer text-zinc-600 hover:text-rose-600 transition-colors"
        strokeWidth={1.75}
        width={17}
        height={17}
        onClick={() => setOpen(true)}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="p-4 pb-0 sm:py-6 sm:px-8 outline-none border-none bg-ivory-1 rounded-2xl grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] max-sm:w-device max-sm:h-device sm:min-w-[calc(85dvw_+_40px)] max-sm:gap-y-6 sm:gap-x-8 sm:h-[92dvh] max-sm:overflow-auto">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          
          {/* LEFT COLUMN: CART ITEMS ------------------------------------ */}
          <section className="flex flex-col gap-4 sm:overflow-y-scroll scrollbar-hide pr-2">
            <div className="flex items-center justify-between border-b border-charcoal-3/15 pb-3">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                Cart Items ({cartItems.length})
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                ID: {String(cart._id).slice(-8)}
              </span>
            </div>

            <section className="flex flex-col divide-y divide-zinc-200">
              {cartItems.map((cartItem) => (
                <CartItem
                  key={String(cartItem._id)}
                  orderItem={cartItem}
                />
              ))}
            </section>
          </section>

          {/* RIGHT COLUMN: COMPLETE CHECKOUT DETAILS --------------------- */}
          <section className="flex flex-col gap-5 sm:overflow-y-auto scrollbar-hide py-1 pl-1">
            <div className="flex flex-col gap-1 border-b border-charcoal-3/15 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                Checkout Details
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Customer & delivery information provided at checkout
              </p>
            </div>
            
            <div className="flex flex-col gap-4 text-sm">
               {/* 1. CUSTOMER / SENDER DETAILS */}
               <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex flex-col gap-2.5">
                 <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                   <UserRound size={13} className="text-zinc-500" />
                   Customer Details
                 </span>
                 <div className="flex flex-col gap-1">
                   <span className="font-bold text-zinc-900 text-[15px]">
                     {customerName || <span className="text-zinc-400 italic">Not provided</span>}
                   </span>
                   <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 mt-0.5">
                     <span className="flex items-center gap-1">
                       <Phone size={12} className="text-zinc-400" />
                       {customerMobile}
                     </span>
                     <span className="flex items-center gap-1">
                       <Mail size={12} className="text-zinc-400" />
                       {customerEmail}
                     </span>
                   </div>
                 </div>
               </div>

               {/* 2. DELIVERY ADDRESS & LOCATION */}
               <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex flex-col gap-2.5">
                 <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                   <MapPin size={13} className="text-zinc-500" />
                   Delivery Address
                 </span>
                 <div className="flex flex-col gap-1.5">
                   <span className="text-zinc-800 font-medium leading-relaxed whitespace-pre-line text-[13px]">
                     {addressText || <span className="text-zinc-400 italic">No address provided</span>}
                   </span>
                   
                   <div className="text-xs text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 flex items-center gap-1.5">
                     <span className="font-semibold text-zinc-500">Landmark:</span>
                     <span className={landmarkText ? "text-zinc-800 font-medium" : "text-zinc-400 italic"}>
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
               <div className={`rounded-xl p-4 border shadow-sm flex flex-col gap-2 ${
                 isDifferentReceiver ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-zinc-200'
               }`}>
                 <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                   <UserCheck size={13} className={isDifferentReceiver ? 'text-amber-600' : 'text-zinc-500'} />
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
               <div className="bg-white rounded-xl p-3.5 border border-zinc-200 shadow-sm flex items-center justify-between">
                 <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                   <PartyPopper size={13} className="text-purple-500" />
                   Occasion
                 </span>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                   occasionName ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-zinc-400 bg-zinc-50 border-zinc-200'
                 }`}>
                   {occasionName || "Not specified"}
                 </span>
               </div>

               {/* 5. ORDER INSTRUCTION / NOTE */}
               {orderNote && (
                 <div className="bg-white rounded-xl p-3.5 border border-zinc-200 shadow-sm flex flex-col gap-1.5">
                   <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                     <MessageSquareText size={13} className="text-blue-500" />
                     Instruction / Message
                   </span>
                   <span className="text-xs text-zinc-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100 whitespace-pre-line leading-relaxed">
                     {orderNote}
                   </span>
                 </div>
               )}

               {/* 6. CART PRICE SUMMARY */}
               <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex flex-col gap-2.5 mt-1">
                 <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                   Cart Summary
                 </span>
                 
                 <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                   <span>Items Total</span>
                   <span>{INRSymbol}{Number(cart.price?.content || 0) + Number(cart.price?.addon || 0) + Number(cart.price?.customization || 0)}</span>
                 </div>

                 {Number(cart.price?.deliveryCharge || 0) > 0 && (
                   <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                     <span>Delivery Charge</span>
                     <span>{INRSymbol}{cart.price.deliveryCharge}</span>
                   </div>
                 )}

                 {Number(cart.price?.platformFee || 0) > 0 && (
                   <div className="flex justify-between items-center text-zinc-600 text-xs font-medium">
                     <span>Platform Fee</span>
                     <span>{INRSymbol}{cart.price.platformFee}</span>
                   </div>
                 )}

                 {Number(cart.price?.couponDiscount || 0) > 0 && (
                   <div className="flex justify-between items-center text-green-600 text-xs font-bold">
                     <span>Coupon Discount</span>
                     <span>-{INRSymbol}{cart.price.couponDiscount}</span>
                   </div>
                 )}

                 <div className="flex justify-between items-center font-bold text-zinc-900 text-base pt-2.5 border-t border-zinc-100">
                   <span>Total Payable</span>
                   <span>{INRSymbol}{cart.price?.payable || cart.price?.total || Math.round((Number(cart.price?.content || 0) + Number(cart.price?.addon || 0) + Number(cart.price?.customization || 0) - (cart.price?.couponDiscount || 0)) * (cart.price?.paymentPercentage || 100) / 100)}</span>
                 </div>
                 
                 <div className="text-[10px] text-zinc-400 text-right font-medium">
                   ({cart.price?.paymentPercentage || 100}% commitment selected)
                 </div>
               </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
