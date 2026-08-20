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

import { useAppStates } from "@/hooks/useAppState/useAppState";

export default function CartPage() {
  // states
  const [showCheckoutDetail, setShowCheckoutDetail] = useState<boolean>(false);
  const [validationTriggered, setValidationTriggered] = useState<boolean>(false);

  // hooks - must be called unconditionally (no try-catch allowed)
  const { isReady, items } = useCart();
  const {
    auth: {
      data: { isAuthenticated },
      method: { onChangeShowAuth }
    }
  } = useAppStates();

  // Preload auth chunk & prompt login immediately on landing in cart if not logged in
  useEffect(() => {
    import("@/components/(frontend)/auth/CustomerAuth");
    if (isReady && items && items.length > 0 && !isAuthenticated) {
      const timer = setTimeout(() => {
        onChangeShowAuth(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isReady, items, isAuthenticated, onChangeShowAuth]);

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
      {/* Savings Banner */}
      <CartSavingAmount />

      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-start">

          {/* Left Column */}
          <div className="md:col-span-8 flex flex-col gap-3 px-0 sm:px-0 py-0 sm:py-0">

            {/* Title + Trust badges */}
            <div className="flex flex-col gap-2 px-0 sm:px-0">
              <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                Your Order • {items.length}{" "}
                {items.length === 1 ? "Item" : "Items"}
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full pb-1 -mb-1 px-0 sm:px-0">
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-green-600" />
                  <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">100% Secure Payments</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                  <Truck className="w-3 h-3 text-blue-600" />
                  <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">Fast & On-time Delivery</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                  <Star className="w-3 h-3 text-amber-600" />
                  <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">10,000+ Happy Customers</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-3 py-1.5 shadow-sm">
                  <RefreshCcw className="w-3 h-3 text-purple-600" />
                  <span className="text-[11px] font-semibold whitespace-nowrap text-zinc-500">Hassle-free Returns</span>
                </div>
                <div className="shrink-0 w-2" />
              </div>
            </div>

            <CartItems validationTriggered={validationTriggered} />
          </div>

          {/* Right Column: Sidebar */}
          <aside className="md:col-span-4 flex flex-col gap-3 md:sticky top-[100px] px-0 sm:px-0">
            <CartCheckout
              showCheckoutDetail={showCheckoutDetail}
              onChangeShowCheckoutDetail={setShowCheckoutDetail}
            />
            <div className="flex flex-col gap-3">
              <CartPrice />
              <ShopMore />
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

      <Suspense>
        <CustomerAuth />
      </Suspense>
    </div>
  );
}
