"use client";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import {
  AtSign,
  Flower2,
  Home,
  Instagram,
  LogIn,
  Shapes,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lazy, memo, Suspense, useMemo, useState } from "react";
import SearchMobile from "../header/page/components/content/components/search/SearchMobile";
import { SearchBarInitialContentsType } from "../header/page/Header";
import CatalogueDrawer from "../background/components/CatalogueDrawer";
import { INSTAGRAM_LINK } from "@/common/constants/companyDetails";

function MobileNavbar({
  searchResults,
}: {
  searchResults: SearchBarInitialContentsType | null;
}) {
  const currPath = usePathname();
  const {
    isTablet,
    auth: {
      data: { showAuth, isAuthenticated, userName },
      method: { onChangeShowAuth },
    },
    location: {
      data: { selectedCity },
    },
    profile: {
      data: { customer },
    },
    sidebar: {
      data: { activeSidebar },
      methods: { onChangeActiveSidebar },
    },
  } = useAppStates();

  const userNameToShow = useMemo(
    () => userName?.split(" ")[0] || "Guest",
    [userName],
  );

  if (
    (currPath || "").startsWith(FRONTEND_LINKS.CART) ||
    (currPath || "").startsWith(`${FRONTEND_LINKS.PRODUCT_PAGE}/`)
  )
    return <div className="h-0 w-0 sticky bottom-0 -mb-64 lg:hidden" />;

  const isAnySidebarOpen = activeSidebar !== null;

  return (
    <div
      // Added transition, transform, and opacity classes to slide it smoothly
      className={`grid grid-cols-4 text-xs text-center px-3 gap-3 pt-3.5 pb-2 z-50 border-t border-charcoal-3/30 bg-ivory-1 sticky bottom-0 lg:hidden -mb-64 transition-all duration-300 ease-in-out transform ${
        isAnySidebarOpen
          ? "translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <Link href={"/"} aria-label="Home">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Home width={18} strokeWidth={1.5} height={18} />
          <span>Home</span>
        </div>
      </Link>

      <CatalogueDrawer
        showDrawer={activeSidebar === "categories"}
        onOpenChange={(isOpen) =>
          onChangeActiveSidebar(isOpen ? "categories" : null)
        }
      />

      <Link target="_blank" href={INSTAGRAM_LINK} aria-label="Instagram">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Instagram width={18} strokeWidth={1.5} height={18} />
          <span>Instagram</span>
        </div>
      </Link>

      {/* <SearchMobile searchResults={searchResults} /> */}
      {/* <Suspense fallback={<></>}>
                <LazyCustomerAuthDrawer
                    showDrawer={showAuth}
                    onChangeShowDrawer={onChangeShowAuth}
                />
            </Suspense> */}

      {isTablet ? (
        isAuthenticated ? (
          <Link
            href={FRONTEND_LINKS.DASHBOARD}
            prefetch={false}
            aria-label="User Dashboard"
          >
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="relative w-4 h-4 text-[10px] scale-150 rounded-full aspect-square bg-gradient-to-br from-transparent from-10% to-charcoal-3/15 text-sienna-1 font-medium -translate-y-px">
                {userName?.slice(0, 1).toUpperCase()}
              </span>
              <span className="translate-y-0.5">
                {userNameToShow.length > 12
                  ? `${userNameToShow.substring(0, 12)}...`
                  : userNameToShow}
              </span>
            </div>
          </Link>
        ) : (
          <div
            onClick={() => onChangeShowAuth(true)}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <LogIn width={18} strokeWidth={1.5} height={18} />
            <span>Login</span>
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
}

export default memo(MobileNavbar);
