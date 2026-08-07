// icons
import { Eye } from "lucide-react";
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
  createOccasionAction,
  selectOccasion
} from "@/store/features/presets/occasionSlice";

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

  // redux states
  const cartStatus = useSelector(selectCart.status);
  const { documents: carts } = useSelector(selectCart.documentList);

  const occasionStatus = useSelector(selectOccasion.status);
  const { documents: occasions } = useSelector(selectOccasion.documentList);

  // variables
  const cart = carts.find(({ _id }) => String(_id) === String(cartId));
  const cartItems = cart?.items || [];
  const occasionName = occasions.find(
    ({ _id }) => String(_id) === String(cart?.checkout?.occasion)
  )?.name;

  // side effects
  useEffect(() => {
    if (cartStatus === "idle") {
      dispatch(createCartAction.fetchDocumentList());
    }
  }, [cartStatus, dispatch]);

  useEffect(() => {
    if (occasionStatus === "idle") {
      dispatch(createOccasionAction.fetchDocumentList());
    }
  }, [occasionStatus, dispatch]);

  if (cart === undefined) {
    return <span className="text-sm">Cart unavailable</span>;
  }

  return (
    <>
      <Eye
        className="cursor-pointer"
        strokeWidth={1.5}
        width={16}
        height={16}
        onClick={() => setOpen((prev) => true)}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="p-4 pb-0 sm:py-5 sm:px-8 outline-none border-none bg-ivory-1 rounded-none sm:rounded-2xl grid grid-cols-1 sm:grid-cols-[4fr_1.5fr] max-sm:w-device max-sm:h-device sm:min-w-[calc(85dvw_+_60px)] max-sm:gap-y-8 sm:gap-x-12 sm:h-[95dvh] max-sm:overflow-auto">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <section className="flex flex-col gap-5 sm:overflow-y-scroll scrollbar-hide pr-2">
            <section className="flex flex-col border-t border-charcoal-3/30 max-sm:mt-3">
              {cartItems.map((cartItem) => (
                <CartItem
                  key={String(cartItem._id)}
                  orderItem={cartItem}
                />
              ))}
            </section>
          </section>

          {/* CHECKOUT DETAILS SECTION ------------------------------------ */}
          <section className="flex flex-col gap-6 sm:overflow-y-auto scrollbar-hide py-2">
            <div className="flex flex-col gap-1.5 border-b border-charcoal-3/20 pb-4">
              <h3 className="text-lg font-bold text-charcoal-2">Checkout Details</h3>
              <p className="text-[11px] text-charcoal-3/50 font-medium">Information provided by user at checkout</p>
            </div>
            
            <div className="flex flex-col gap-5 text-sm">
               {/* Contact Info */}
               <div className="flex flex-col gap-1">
                 <span className="font-bold text-charcoal-3/60 uppercase text-[10px] tracking-widest">Customer Details</span>
                 <span className="font-semibold text-charcoal-2 text-[15px]">{cart.checkout?.name || <span className="text-charcoal-3/40 italic">Not provided</span>}</span>
                 <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-charcoal-3 font-medium">{cart.checkout?.contact?.mobileNumber || "-"}</span>
                    <span className="text-charcoal-3/70 text-xs">{cart.checkout?.contact?.mail || "-"}</span>
                 </div>
               </div>

               {/* Delivery Location */}
               <div className="flex flex-col gap-1">
                 <span className="font-bold text-charcoal-3/60 uppercase text-[10px] tracking-widest">Delivery Address</span>
                 <div className="bg-charcoal-3/5 rounded-xl p-3 border border-charcoal-3/10">
                    <span className="text-charcoal-2 font-medium leading-relaxed block mb-1">
                      {cart.checkout?.location?.address || <span className="text-charcoal-3/40 italic">No address provided</span>}
                    </span>
                    {cart.checkout?.location?.landmark && (
                      <span className="text-xs text-charcoal-3/70 block mb-1">
                        <span className="font-semibold">Landmark:</span> {cart.checkout.location.landmark}
                      </span>
                    )}
                    <span className="text-charcoal-3 text-xs font-semibold">
                      {cart.checkout?.location?.city || ""}
                      {cart.checkout?.location?.pincode ? ` - ${cart.checkout.location.pincode}` : ""}
                    </span>
                 </div>
               </div>

               {/* Receiver Info */}
               {cart.checkout?.deliverToSomeoneElse && (
                 <div className="flex flex-col gap-1 p-3 bg-sienna-3/20 rounded-xl border border-sienna-3/30">
                   <span className="font-bold text-sienna-1 uppercase text-[10px] tracking-widest">Receiver Info</span>
                   <span className="font-bold text-charcoal-2">{cart.checkout.receiverName || "-"}</span>
                   <span className="text-charcoal-3 text-xs font-medium">{cart.checkout.receiverMobileNumber || "-"}</span>
                 </div>
               )}

               {/* Occasion */}
               {cart.checkout?.occasion && (
                 <div className="flex flex-col gap-1">
                   <span className="font-bold text-charcoal-3/60 uppercase text-[10px] tracking-widest">Occasion</span>
                   <span className="font-bold text-blue-600 capitalize bg-blue-50 w-fit px-3 py-0.5 rounded-full text-xs border border-blue-100">
                    {occasionName || String(cart.checkout.occasion)}
                   </span>
                 </div>
               )}

               {/* Price Summary */}
               <div className="mt-4 pt-5 border-t border-charcoal-3/20 flex flex-col gap-3">
                 <span className="font-bold text-charcoal-3/60 uppercase text-[10px] tracking-widest mb-1">Cart Summary</span>
                 <div className="flex justify-between items-center text-charcoal-3 text-xs font-medium">
                   <span>Items Total</span>
                   <span>{INRSymbol}{Number(cart.price?.content || 0) + Number(cart.price?.addon || 0) + Number(cart.price?.customization || 0)}</span>
                 </div>
                 {cart.price?.couponDiscount > 0 && (
                   <div className="flex justify-between items-center text-green-600 text-xs font-bold">
                     <span>Coupon Discount</span>
                     <span>-{INRSymbol}{cart.price.couponDiscount}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center font-bold text-charcoal-2 text-[17px] mt-1 pt-3 border-t border-dashed border-charcoal-3/20">
                   <span>Payable Amt.</span>
                   <span>{INRSymbol}{Math.round((Number(cart.price?.content || 0) + Number(cart.price?.addon || 0) + Number(cart.price?.customization || 0) - (cart.price?.couponDiscount || 0)) * (cart.price?.paymentPercentage || 100) / 100)}</span>
                 </div>
                 <div className="text-[10px] text-charcoal-3/50 text-right font-bold">
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
