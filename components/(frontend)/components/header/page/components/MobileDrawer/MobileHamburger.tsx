"use client";

import { X } from "lucide-react";
import HamburgerContact from "./components/HamburgerContact";
import HamburgerDashboard from "./components/HamburgerDashboard";
import HamburgerHeader from "./components/HamburgerHeader";
import HamburgerNav from "./components/HamburgerNav";
import { CustomerDocument } from "@/common/types/documentation/users/customer";
import { HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";
import { useEffect } from "react";
import { COMPANY_NAME } from "@/common/constants/companyDetails";

export default function MobileHamburger({
  isAuthenticated,
  customerName,
  customer,
  navLinks,
  open,
  onOpenChange,
}: {
  isAuthenticated: boolean;
  customerName: string | null;
  customer: CustomerDocument | null;
  navLinks: HeaderNavLinkDocument[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      {/* ── Backdrop ────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[99998] bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* ── Drawer Container ────────────────────────── */}
      <div
        onKeyDown={({ key }) =>
          key === "Escape" ? onOpenChange(false) : () => {}
        }
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed inset-0 sm:right-auto sm:w-[400px] h-[100dvh] z-[99999] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out select-none text-left ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Fixed Clean Top Bar ─────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-white shrink-0">
          <span className="text-[17px] font-bold text-zinc-900 tracking-tight">
            Menu
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-5 py-3 pb-[max(24px,env(safe-area-inset-bottom))] space-y-4">
          <HamburgerHeader
            customerName={customerName}
            customer={customer}
            close={() => onOpenChange(false)}
          />

          <HamburgerDashboard
            isAuthenticated={isAuthenticated}
            onClose={() => onOpenChange(false)}
          />

          <HamburgerNav
            navLinks={navLinks}
            close={() => onOpenChange(false)}
          />

          <HamburgerContact
            onClose={() => onOpenChange(false)}
          />

          <div className="pt-3 pb-4 text-center">
            <p className="text-[11px] text-zinc-400 font-medium">
              © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
