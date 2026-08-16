"use client";

import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import {
  Home,
  Instagram,
  LogIn,
  Shapes,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo, lazy, Suspense } from "react";
import CatalogueDrawer from "../background/components/CatalogueDrawer";
import { INSTAGRAM_LINK } from "@/common/constants/companyDetails";

import { SearchBarInitialContentsType } from "../header/page/Header";

const LazyCustomerAuthDrawer = lazy(
  () => import("@/components/(frontend)/auth/components/CustomerAuthDrawer")
);

function MobileNavbar({
  searchResults,
}: {
  searchResults?: SearchBarInitialContentsType | null;
}) {
  const currPath = usePathname() || "";
  const {
    auth: {
      data: { showAuth, isAuthenticated, userName },
      method: { onChangeShowAuth },
    },
    sidebar: {
      data: { activeSidebar },
      methods: { onChangeActiveSidebar },
    },
  } = useAppStates();

  const userNameToShow = useMemo(
    () => userName?.split(" ")[0] || "Account",
    [userName],
  );

  // Hide mobile navbar on cart & product details pages
  if (
    currPath.startsWith(FRONTEND_LINKS.CART) ||
    currPath.startsWith(`${FRONTEND_LINKS.PRODUCT_PAGE}/`)
  ) {
    return <div className="h-0 w-0 sticky bottom-0 -mb-64 lg:hidden" />;
  }

  const isAnySidebarOpen = activeSidebar !== null;
  const isHomeActive = currPath === "/";
  const isCategoriesActive = activeSidebar === "categories";
  const isDashboardActive = currPath.startsWith(FRONTEND_LINKS.DASHBOARD);

  // Common glassmorphism item style with iPad scaling
  const getItemClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full transition-all duration-200 select-none cursor-pointer ${
      isActive
        ? "bg-white/95 text-sienna-1 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)] font-semibold scale-[1.02]"
        : "text-zinc-600 hover:text-zinc-950 hover:bg-white/40 active:bg-white/70 active:scale-90 font-medium"
    }`;

  return (
    <>
      <nav
        role="navigation"
        aria-label="Mobile Navigation"
        className={`fixed bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] sm:max-w-[480px] md:max-w-[520px] grid grid-cols-4 items-center text-[10.5px] sm:text-[13px] text-center p-1.5 sm:p-2 z-50 rounded-full backdrop-blur-3xl bg-white/85 border border-white/80 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.18),0_2px_8px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.9)] lg:hidden transition-all duration-300 ease-out transform ${
          isAnySidebarOpen
            ? "translate-y-24 opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        {/* 1. Home Tab */}
        <Link href={"/"} aria-label="Home" className="focus:outline-none">
          <div className={getItemClass(isHomeActive)}>
            <Home
              strokeWidth={isHomeActive ? 2.2 : 1.7}
              className="w-[19px] h-[19px] sm:w-[22px] sm:h-[22px] transition-transform duration-200"
            />
            <span className="leading-tight">Home</span>
          </div>
        </Link>

        {/* 2. Categories Tab */}
        <CatalogueDrawer
          showDrawer={activeSidebar === "categories"}
          onOpenChange={(isOpen) =>
            onChangeActiveSidebar(isOpen ? "categories" : null)
          }
          className={getItemClass(isCategoriesActive)}
        />

        {/* 3. Instagram Tab */}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={INSTAGRAM_LINK}
          aria-label="Instagram"
          className="focus:outline-none"
        >
          <div className={getItemClass(false)}>
            <Instagram
              strokeWidth={1.7}
              className="w-[19px] h-[19px] sm:w-[22px] sm:h-[22px] transition-transform duration-200"
            />
            <span className="leading-tight">Instagram</span>
          </div>
        </Link>

        {/* 4. Account / Login Tab */}
        {isAuthenticated ? (
          <Link
            href={FRONTEND_LINKS.DASHBOARD}
            prefetch={false}
            aria-label="User Account"
            className="focus:outline-none"
          >
            <div className={getItemClass(isDashboardActive)}>
              <div className="w-[19px] h-[19px] sm:w-[22px] sm:h-[22px] rounded-full bg-sienna-1/15 border border-sienna-1/30 flex items-center justify-center text-[9px] sm:text-[11px] text-sienna-1 font-bold">
                {userName?.slice(0, 1).toUpperCase() || <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </div>
              <span className="leading-tight truncate max-w-[56px] sm:max-w-[80px]">
                {userNameToShow}
              </span>
            </div>
          </Link>
        ) : (
          <div
            onClick={() => onChangeShowAuth(true)}
            className={getItemClass(showAuth)}
          >
            <LogIn
              strokeWidth={1.7}
              className="w-[19px] h-[19px] sm:w-[22px] sm:h-[22px] transition-transform duration-200"
            />
            <span className="leading-tight">Login</span>
          </div>
        )}
      </nav>

      {/* Customer Auth Drawer for Login */}
      <Suspense fallback={<></>}>
        <LazyCustomerAuthDrawer
          showDrawer={showAuth}
          onChangeShowDrawer={onChangeShowAuth}
        />
      </Suspense>
    </>
  );
}

export default memo(MobileNavbar);
