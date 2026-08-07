"use client";

import useTimeRemaining from "@/hooks/useTimeRemaining";
import { useEffect, useState } from "react";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";
import { ArrowRight, BadgePercent, ChevronRight, Truck } from "lucide-react";
import ShineAnimation from "@/components/(frontend)/global/_Templates/ShineAnimation/ShineAnimation";

interface MobileStickyFooterProps {
  pricePerUnit: number;
  activeCouponCount: number;
  onBookNow: () => void;
  onAddToCart: () => void;
  onShowCoupons: () => void;
  processingTime: number;
  lastDeliverySlotTime?: string;
}

export default function MobileStickyFooter({
  pricePerUnit,
  activeCouponCount,
  onBookNow,
  onAddToCart,
  onShowCoupons,
  processingTime,
  lastDeliverySlotTime,
}: MobileStickyFooterProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { hours, minutes, seconds, date } = useTimeRemaining(
    processingTime,
    lastDeliverySlotTime,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const remainingTime = `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

  // Determine if it's "Today" delivery
  const isToday =
    date && new Date(date).toDateString() === new Date().toDateString();
  const isTomorrow =
    date &&
    new Date(date).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Tier 1: Delivery Banner */}
      {date && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-[#fff2f6] py-1 border-b border-[#feebf1]">
          <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-moss antialiased">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {isToday
              ? "Get Delivered Today"
              : isTomorrow
                ? "Get Delivered Tomorrow"
                : `Get Delivered by ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            {isToday && isMounted && (
              <span className="flex items-center gap-1">
                <span>Order within</span>
                <span className="text-[11px] sm:text-[13px] tracking-tighter text-zinc-900">
                  {remainingTime}
                </span>
              </span>
            )}
          </span>
        </div>
      )}

      {/* Tier 2: Actions */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2 py-2.5 sm:px-3 sm:py-3">
        <div className="flex flex-col gap-0.5 shrink-0">
          <div className="flex items-end gap-1">
            <span className="text-[17px] min-[380px]:text-lg sm:text-xl font-bold tracking-[-0.03em] text-zinc-900">
              {INRSymbol}
              {pricePerUnit}
            </span>
            <span className="pb-0.5 text-[9px] sm:text-[10px] font-medium text-zinc-400">
              incl. taxes
            </span>
          </div>

          <div
            onClick={activeCouponCount ? onShowCoupons : undefined}
            className={`flex w-max items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px] font-semibold text-emerald-600 ${activeCouponCount ? "cursor-pointer" : ""}`}
          >
            <BadgePercent className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>
              {activeCouponCount
                ? `${activeCouponCount} Offers`
                : "Freshly Picked"}
            </span>
            {activeCouponCount ? <ChevronRight className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> : null}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-1.5">
          <button
            onClick={onAddToCart}
            className="flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-moss/30 bg-white px-1.5 py-1.5 sm:px-2.5 sm:py-2 md:py-3 text-moss shadow-sm transition-all duration-300 active:scale-[0.98]"
          >
            <span className="text-[10px] min-[380px]:text-[10.5px] sm:text-[11.5px] font-semibold">Add to cart</span>
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 max-[350px]:hidden" />
          </button>

          <button
            onClick={onBookNow}
            className="group relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-lg bg-moss px-2 py-1.5 sm:px-3 sm:py-2 md:py-3 text-[10px] min-[380px]:text-[10.5px] sm:text-[11.5px] font-semibold text-white shadow-md transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
          >
            <ShineAnimation isPersistent />
            <span>Buy Now</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 max-[350px]:hidden transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
