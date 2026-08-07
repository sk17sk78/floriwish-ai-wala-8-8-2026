// icons
import { ChevronDown } from "lucide-react";

// constants
import { INRSymbol } from "@/common/constants/symbols";

// hooks
import { useState } from "react";
import { useCart } from "@/hooks/useOptimizedCart/useCart";

// types
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";

export default function CartPrice() {
  // hooks
  const { price, coupon } = useCart();

  // states
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div
      className="flex flex-col justify-start gap-4"
    >
      <section className="bg-white rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-ivory-1/50 px-5 py-3 border-b border-charcoal-3/10">
          <span className="text-[11px] font-extrabold text-charcoal-3/60 uppercase tracking-[0.1em]">
            Bill Summary
          </span>
        </div>
        
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-charcoal-3/70">
            <span>Item Total</span>
            <span className="font-bold text-charcoal-3">{`${INRSymbol} ${price.content + price.customization}`}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-charcoal-3/70">
            <span>Add-ons Price</span>
            <span className="font-bold text-charcoal-3">{`${INRSymbol} ${price.addon}`}</span>
          </div>
          
          {Boolean(price.couponDiscount) && (
            <div className="flex items-center justify-between text-sm font-bold text-emerald-600">
              <span className="flex items-center gap-1">
                Coupon ({(coupon as CouponDocument)?.code})
              </span>
              <span>{`- ${INRSymbol} ${price.couponDiscount}`}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-charcoal-3/70">
            <span>Delivery Fee</span>
            <span className={`font-bold ${price.deliveryCharge === 0 ? "text-emerald-600 uppercase text-xs" : "text-charcoal-3"}`}>
              {price.deliveryCharge === 0 ? "Free" : `${INRSymbol} ${price.deliveryCharge}`}
            </span>
          </div>

          {Boolean(price.platformFee) && (
            <div className="flex items-center justify-between text-sm text-charcoal-3/70">
              <span>Platform Fees</span>
              <span className="font-bold text-charcoal-3">{`${INRSymbol} ${price.platformFee}`}</span>
            </div>
          )}
        </div>

        <div className="mt-auto px-5 py-4 bg-ivory-1/20 border-t border-charcoal-3/10">
          <div className="flex items-center justify-between font-bold text-lg text-charcoal-3">
            <span>Grand Total</span>
            <span>{`${INRSymbol} ${price.total}`}</span>
          </div>
        </div>

        {price.due > 0 && (
          <div className="px-5 py-3 bg-sienna-1/5 border-t border-sienna-1/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-bold text-sienna-1">
              <span>Amount to Pay</span>
              <span>{`${INRSymbol} ${price.payable}`}</span>
            </div>
            
            <div
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="cursor-pointer text-[10px] text-charcoal-3/50 flex items-center gap-1 hover:text-charcoal-3 transition-colors"
            >
              <span>See breakdown</span>
              <ChevronDown
                width={12}
                height={12}
                className={`transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`}
              />
            </div>
            
            {showBreakdown && (
              <div className="text-[11px] text-charcoal-3/60 space-y-1 mt-1 pt-2 border-t border-sienna-1/10">
                <div className="flex justify-between">
                  <span>Base ({price.paymentPercentage}%)</span>
                  <span>{INRSymbol} {Math.ceil(price.content * (price.paymentPercentage / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Addons (100%)</span>
                  <span>{INRSymbol} {price.addon}</span>
                </div>
                <div className="flex justify-between font-bold text-red-500 pt-1">
                  <span>Amount Due</span>
                  <span>{INRSymbol} {price.due}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
