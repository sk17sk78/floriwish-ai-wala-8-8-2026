"use client";

// icons
import { ShoppingBag } from "lucide-react";

// utils
import { memo } from "react";

// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import Link from "next/link";

function HeaderCart() {
  // hooks
  const {
    isReady,
    cart: {
      data: { itemsCount },
    },
  } = useAppStates();

  return (
    <Link
      href={"/cart"}
      prefetch={false}
      aria-label="Shopping Cart"
      className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer hover:bg-charcoal-3/5 group`}
    >
      <div className="relative">
        <ShoppingBag
          strokeWidth={1.5}
          width={22}
          height={22}
          className="text-charcoal-3/70 group-hover:text-charcoal-3/90 transition-colors"
        />
        {Boolean(isReady && itemsCount) && (
          <span className="absolute flex items-center justify-center -top-1.5 -right-1.5 rounded-full text-[9px] font-bold w-4 h-4 bg-sienna-1 text-white shadow-sm ring-2 ring-white">
            {itemsCount}
          </span>
        )}
      </div>
    </Link>
  );
}

export default memo(HeaderCart);
