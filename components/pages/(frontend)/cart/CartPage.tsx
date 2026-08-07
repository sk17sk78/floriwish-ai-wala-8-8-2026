"use client";

// icons
import { Loader2, RefreshCcw, ShieldCheck, Star, Truck } from "lucide-react";

// constants
import { GOOGLE_ANALYTICS_ID } from "@/common/constants/environmentVariables";

// utils
import { lazy, useState, useEffect } from "react";

// hooks
import { useCart } from "@/hooks/useOptimizedCart/useCart";

// components
import CartCheckout from "@/components/(frontend)/cart/delivery/CartCheckout";
import CartCouponSection from "@/components/(frontend)/cart/coupon/CartCouponSection";
import CartItems from "@/components/(frontend)/cart/items/CartItems";
import CartPrice from "@/components/(frontend)/cart/price/CartPrice";
import CartSavingAmount from "@/components/(frontend)/cart/savingAmount/CartSavingAmount";
import CartPaymentButton from "@/components/(frontend)/cart/paymentButton/CartPaymentButton";
import CartPaymentPercentage from "@/components/(frontend)/cart/paymentPercentage/CartPaymentPercentage";
const CustomerAuth = lazy(
  () => import("@/components/(frontend)/auth/CustomerAuth"),
);
import Link from "next/link";
import ShopMore from "@/components/(frontend)/cart/shopMore/ShopMore";
import { Suspense } from "react";
import { SettingProvider } from "@/hooks/useSetting/useSetting";
import { Check } from "lucide-react";
import { HorizontalSpacing } from "@/components/(frontend)/global/_Spacings/HorizontalSpacings";

export default function CartPage() {
  // states
  const [showCheckoutDetail, setShowCheckoutDetail] = useState<boolean>(false);
  const [validationTriggered, setValidationTriggered] = useState<boolean>(false);

  // hooks - must be called unconditionally (no try-catch allowed)
  const { isReady, items } = useCart();

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 sm:col-span-2 h-[80dvh] ">
        <span className="flex items-center justify-center gap-2 text-2xl">
          <span>Loading</span>
          <Loader2 className="animate-spin" />
        </span>
      </div>
    );
  }

  if (!items || !Array.isArray(items) || !items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 sm:col-span-2 h-[80dvh] ">
        <span className="text-2xl">Your Cart is Empty</span>
        <span className="text-sm text-charcoal-3/60">
          Start with adding an item of choice
        </span>
        <Link
          href={"/"}
          className="mt-5 bg-charcoal rounded-lg px-6 py-2 text-sienna-3 font-light sm:text-sm transition-all duration-300 hover:text-charcoal-3 hover:bg-sienna/70"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory-1 min-h-screen w-full mx-auto">
      {/* 1. Full-Width Savings Banner */}
      <CartSavingAmount />

      <HorizontalSpacing className="py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Left Column: Products and Title */}
            <div className="md:col-span-8 flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <h2 className="px-1 text-[12px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  Your Order • {items.length}{" "}
                  {items.length === 1 ? "Item" : "Items"}
                </h2>

                {/* Trust Badges Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3.5 py-2 shadow-sm transition-all hover:border-zinc-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">
                      100% Secure Payments
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">
                      Fast & On-time Delivery
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">
                      10,000+ Happy Customers
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                    <RefreshCcw className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">
                      Hassle-free Returns
                    </span>
                  </div>
                </div>
              </div>

              

              <CartItems validationTriggered={validationTriggered} />
            </div>

            {/* Right Column: Sidebar (Sticky) */}
            <aside className="md:col-span-4 flex flex-col gap-5 md:sticky top-[100px] md:pt-[92px]">
              <CartCheckout
                showCheckoutDetail={showCheckoutDetail}
                onChangeShowCheckoutDetail={setShowCheckoutDetail}
              />

              <div className="flex flex-col gap-5">
                <CartPrice />
                <div className="mt-2">
                  <ShopMore />
                </div>
                <CartCouponSection />
                <CartPaymentPercentage />
              </div>

              <SettingProvider>
                <CartPaymentButton
                  onChangeShowCheckoutDetail={setShowCheckoutDetail}
                  onValidationTrigger={() => setValidationTriggered(true)}
                />
              </SettingProvider>
            </aside>
          </div>
        </div>
      </HorizontalSpacing>

      <Suspense>
        <CustomerAuth />
      </Suspense>
    </div>
  );
}
