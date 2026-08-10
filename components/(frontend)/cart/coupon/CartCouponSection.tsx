"use client";

import { useMemo, useState } from "react";
import { Tag, ChevronDown, ChevronUp, ChevronRight, CheckCircle2, X } from "lucide-react";
import { useCart } from "@/hooks/useOptimizedCart/useCart";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";
import { INRSymbol } from "@/common/constants/symbols";

export default function CartCouponSection() {
  const {
    items,
    price: { content, customization, couponDiscount },
    coupon: appliedCoupon,
    onChangeCoupon
  } = useCart();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const orderAmount = content + customization;

  // Real coupons from cart items
  const realCoupons = useMemo(() => {
    return (
      items.flatMap(
        ({ content }) =>
          (content as ContentDocument)._coupons as CouponDocument[]
      ) || []
    ).filter(
      (coupon, index, self) =>
        self.findIndex((c) => String(c._id) === String(coupon._id)) === index
    );
  }, [items]);

  // Fallback demo coupons if no coupons attached to products in DB
  const displayCoupons = useMemo(() => {
    if (realCoupons.length > 0) return realCoupons;

    return [
      {
        _id: "demo-savebig",
        code: "SAVEBIG",
        type: "discount",
        description: "Min. order ₹4,500 · Get 10% OFF on Orders above 4500",
        minimumOrderAmount: 4500,
        limitPerCustomer: 1,
        valid: { startDate: new Date(), endDate: new Date() },
        discount: { type: "percentage", limit: 300, percentage: 10 },
        applicableCategories: []
      },
      {
        _id: "demo-newuser",
        code: "NEWUSER",
        type: "discount",
        description: "Min. order ₹1,998 · FLAT ₹100 OFF FOR NEWUSER ORDERS ABOVE 1999",
        minimumOrderAmount: 1998,
        limitPerCustomer: 1,
        valid: { startDate: new Date(), endDate: new Date() },
        discount: { type: "fixed", limit: 100 },
        applicableCategories: []
      }
    ] as unknown as CouponDocument[];
  }, [realCoupons]);

  const handleApplyCoupon = (coupon: CouponDocument) => {
    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      setErrorMessage(`Add items worth ${INRSymbol}${coupon.minimumOrderAmount - orderAmount} more to unlock this code`);
      return;
    }
    setErrorMessage("");
    onChangeCoupon(coupon);
    setIsExpanded(false);
  };

  const handleApplyCustomCode = () => {
    if (!inputCode.trim()) return;
    const matched = displayCoupons.find(
      (c) => c.code.toLowerCase() === inputCode.trim().toLowerCase()
    );
    if (matched) {
      handleApplyCoupon(matched);
    } else {
      setErrorMessage(`Invalid code "${inputCode.trim()}". Try SAVEBIG or NEWUSER.`);
    }
  };

  const getOfferTitle = (coupon: CouponDocument) => {
    // Only show description, not auto-generated discount text
    if (coupon.description) {
      return coupon.description;
    }
    // Fallback if no description
    return "Special Offer";
  };

  const getOfferSubtitle = (coupon: CouponDocument) => {
    // Remove subtitle since description is now the main title
    if (coupon.minimumOrderAmount) {
      return `Min. order ${INRSymbol}${coupon.minimumOrderAmount.toLocaleString("en-IN")}`;
    }
    return "";
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200/80 p-3 sm:p-3.5 shadow-2xs transition-all my-1.5 hover:border-zinc-300">
      {/* 1. Applied Coupon Header View */}
      {appliedCoupon ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-2xs">
                <CheckCircle2 width={17} height={17} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-emerald-700 truncate">
                  Code &quot;{appliedCoupon.code}&quot; applied!
                </span>
                <span className="text-[10.5px] font-semibold text-emerald-600">
                  Saved {INRSymbol}{couponDiscount} on this order
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeCoupon(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline shrink-0"
            >
              Remove
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-1 py-0.5"
          >
            <span>{isExpanded ? "Hide offers" : "View other offers"}</span>
            {isExpanded ? <ChevronUp width={13} height={13} /> : <ChevronDown width={13} height={13} />}
          </button>
        </div>
      ) : (
        /* 2. Collapsed View (Compact & Premium) */
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2.5 cursor-pointer select-none py-0.5"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
              <Tag width={16} height={16} className="fill-emerald-100" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight">
                Have a promo code?
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate">
                {displayCoupons.length} {displayCoupons.length === 1 ? "offer" : "offers"} available
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp width={16} height={16} className="text-zinc-400 shrink-0" />
          ) : (
            <ChevronDown width={16} height={16} className="text-zinc-400 shrink-0" />
          )}
        </div>
      )}

      {/* 3. Expanded View Content */}
      {isExpanded && (
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3 mt-3">
          {/* Custom Input Row */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-1 pl-3 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Tag width={14} height={14} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Enter code e.g. BALLOON10"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setErrorMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyCustomCode();
              }}
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase text-zinc-900 placeholder:normal-case placeholder:font-medium placeholder:text-zinc-400"
            />
            <button
              type="button"
              disabled={!inputCode.trim()}
              onClick={handleApplyCustomCode}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 font-bold text-xs hover:bg-emerald-500 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-200 disabled:hover:text-zinc-600 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold flex items-center justify-between gap-2">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => setErrorMessage("")}>
                <X width={13} height={13} className="text-rose-500 hover:text-rose-700" />
              </button>
            </div>
          )}

          {/* AVAILABLE OFFERS List */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              AVAILABLE OFFERS
            </span>

            <div className="flex flex-col gap-2.5">
              {displayCoupons.map((coupon) => (
                <div
                  key={String(coupon._id)}
                  className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all"
                >
                  {/* Code Badge */}
                  <span className="bg-emerald-100 text-emerald-700 font-black text-[11px] tracking-wider uppercase py-1.5 px-2.5 rounded-lg shrink-0">
                    {coupon.code}
                  </span>

                  {/* Offer Info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-900 leading-tight line-clamp-2">
                      {getOfferTitle(coupon)}
                    </span>
                    {getOfferSubtitle(coupon) && (
                      <span className="text-[10.5px] text-zinc-500 font-medium mt-0.5">
                        {getOfferSubtitle(coupon)}
                      </span>
                    )}
                  </div>

                  {/* Apply Chevron Button */}
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(coupon)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shrink-0 cursor-pointer"
                  >
                    <ChevronRight width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
