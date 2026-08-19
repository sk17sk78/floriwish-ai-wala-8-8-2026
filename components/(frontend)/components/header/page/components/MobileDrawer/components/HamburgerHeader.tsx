"use client";

import { memo, useMemo } from "react";
import { ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { type CustomerDocument } from "@/common/types/documentation/users/customer";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { useAppStates } from "@/hooks/useAppState/useAppState";

function HamburgerHeader({
  customerName,
  customer,
  close
}: {
  customerName: string | null;
  customer: CustomerDocument | null;
  close: () => void;
}) {
  const {
    auth: {
      method: { onChangeShowAuth }
    }
  } = useAppStates();

  const username = useMemo(() => customerName || "Guest", [customerName]);
  const isGuest = !customerName && !customer;

  if (isGuest) {
    return (
      <div className="py-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-semibold text-zinc-900">Welcome, Guest</p>
          <p className="text-xs text-zinc-400 mt-0.5">Sign in to track orders & wishlist</p>
        </div>
        <button
          type="button"
          onClick={() => {
            close();
            onChangeShowAuth(true);
          }}
          className="px-3.5 py-1.5 rounded-lg border border-[#b76e79] text-[#b76e79] hover:bg-rose-50 text-xs font-semibold shrink-0 cursor-pointer transition-colors active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-zinc-100">
      <Link
        href={FRONTEND_LINKS.DASHBOARD + FRONTEND_LINKS.DASHBOARD_PROFILE}
        prefetch={false}
        onClick={close}
        className="flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200/80 text-[#b76e79] flex items-center justify-center font-bold text-sm shrink-0">
            {username[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-[#b76e79] transition-colors">
              {username}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {customer?.mail || customer?.mobileNumber || "View Account"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#b76e79] transition-colors shrink-0" />
      </Link>
    </div>
  );
}

export default memo(HamburgerHeader);
