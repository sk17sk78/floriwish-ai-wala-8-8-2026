import { X } from "lucide-react";
import HamburgerContact from "./components/HamburgerContact";
import HamburgerDashboard from "./components/HamburgerDashboard";
import HamburgerHeader from "./components/HamburgerHeader";
import HamburgerNav from "./components/HamburgerNav";
import { CustomerDocument } from "@/common/types/documentation/users/customer";
import { HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";
import { useEffect } from "react";

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
      {/* Backdrop: Slowed down to 300ms to match the sidebar's gracefulness */}
      <div
        className={`fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        onKeyDown={({ key }) =>
          key === "Escape" ? onOpenChange(false) : () => {}
        }
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        // Sidebar: Changed to transition-transform, duration-400, ease-in-out. Removed opacity changes.
        className={`fixed top-0 left-0 w-full sm:w-[500px] h-[100dvh] z-[999] bg-[#fbfbfb] sm:border-r border-black/15 shadow-2xl transition-transform duration-400 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. Positioned absolutely so it floats over the scrolling content */}
        <div className="absolute top-3 right-3 z-50 flex items-center justify-end bg-transparent">
          <X
            width={36}
            height={36}
            aria-label="Close menu"
            className="aspect-square rounded-full bg-white/60 backdrop-blur-sm hover:bg-black/10 p-1.5 transition-colors duration-200 cursor-pointer"
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* 2. Made the section take full height and added pt-14 so initial content clears the X button */}
        <section className="h-full w-full pt-14 px-3 overflow-auto scrollbar-hide">
          <HamburgerHeader
            customerName={customerName}
            customer={customer}
            close={() => onOpenChange(false)}
          />
          <HamburgerDashboard
            isAuthenticated={isAuthenticated}
            onClose={() => {
              onOpenChange(false);
            }}
          />
          <HamburgerNav navLinks={navLinks} close={() => onOpenChange(false)} />
          <div className="mt-8">
            <HamburgerContact onClose={() => onOpenChange(false)} />
          </div>
          <div className="bg-transparent h-6 w-full" />
        </section>
      </div>
    </>
  );
}
