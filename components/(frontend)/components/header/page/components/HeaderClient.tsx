"use client";

// utils
import { lazy, memo, Suspense, useState, useEffect } from "react";

// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import MobileHeaderDrawer from "./MobileDrawer/MobileHeaderDrawer";
import HeaderCart from "./content/HeaderCart";
import HeaderContact from "./content/HeaderContact";
import HeaderLogo from "@/components/(_common)/Logo/HeaderLogo";
import HeaderUserContent from "./content/HeaderUserContent";
import HeaderMore from "./content/HeaderMore";
import HeaderSellWithUs from "./content/HeaderSellWithUs";
import HeaderNavBar from "./navBar/HeaderNavBar";
import SearchDesktop from "./content/components/search/SearchDesktop";
import SearchMobile from "./content/components/search/SearchMobile";
import SelectCityMobile from "@/components/(frontend)/global/SelectCity/SelectCityMobile";
import SelectCityDesktop from "@/components/(frontend)/global/SelectCity/SelectCityDesktop";
import WidthWrapper from "@/components/(frontend)/components/wrapper/WidthWrapper";
import ContentHorizontalSpacing from "@/components/(frontend)/content/spacing/ContentHorizontalSpacing";

// lazy components
const LazyGoogleOnlyAuth = lazy(
  () => import("@/components/(frontend)/auth/GoogleOnlyAuth"),
);

// types
import { type SearchBarInitialContentsType } from "../Header";
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

function HeaderClient({
  navLinks,
  searchResults,
}: {
  navLinks: HeaderNavLinkDocument[];
  searchResults: SearchBarInitialContentsType | null;
}) {
  // hooks
  const {
    isTablet,
    auth: {
      data: { showAuth, isAuthenticated, userName },
      method: { onChangeShowAuth },
    },
    location: {
      data: { selectedCity },
      methods: { onToggleShowCitySelector },
    },
    profile: {
      data: { customer },
    },
    sidebar: {
      data: { activeSidebar },
    },
  } = useAppStates();


  return (
    <>
      <header
        className={`!z-50 pt-3 border-b border-ash-3/30 lg:pt-4.5 max-lg:sticky max-lg:top-0 bg-ivory-1 flex flex-col justify-start h-fit 1200:px-0`}
      >
        <WidthWrapper className={"max-lg:!px-1 z-30"}>
          <div className="relative flex items-center justify-between pb-2.5 lg:pb-3 max-lg:px-2 gap-2">
            {/* Left side actions & Logo */}
            <div className="flex items-center gap-2.5 lg:gap-3 xl:gap-6 z-10 shrink-0">
              {/* Logo - Centered on tablet/mobile, default flow on desktop */}
              <div className="lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-auto shrink-0">
                <HeaderLogo />
              </div>

              <MobileHeaderDrawer
                isAuthenticated={isAuthenticated}
                customerName={userName}
                customer={customer}
                navLinks={navLinks}
              />
              <SelectCityDesktop
                selectedCity={selectedCity}
                onClick={() => {
                  onToggleShowCitySelector(true);
                }}
              />
            </div>

            <SearchDesktop searchResults={searchResults} />

            {/* Right-side actions */}
            <div className="flex items-center justify-end gap-1.5 lg:gap-2 xl:gap-3 z-10 shrink-0">
              {activeSidebar !== "menu" && (
                <>
                  <SearchMobile searchResults={searchResults} />
                </>
              )}

              {/* Desktop-only actions */}
              <div className="hidden lg:flex items-center gap-1.5 xl:gap-3">
                <div className="hidden xl:block">
                  <HeaderSellWithUs />
                </div>
                <HeaderUserContent
                  isAuthenticated={isAuthenticated}
                  userName={userName}
                  onClick={() => {
                    onChangeShowAuth(true);
                  }}
                />
              </div>

              {activeSidebar !== "menu" && (
                <>
                  <HeaderCart />
                </>
              )}

              <div className="hidden lg:block">
                <HeaderMore />
              </div>
            </div>
          </div>
        </WidthWrapper>
        <div className="sm:hidden">
          <SelectCityMobile
            selectedCity={selectedCity}
            onClick={() => {
              onToggleShowCitySelector(true);
            }}
          />
        </div>
        <HeaderNavBar navLinks={navLinks} />
      </header>
      <Suspense fallback={<></>}>
        <LazyGoogleOnlyAuth
          openAuth={showAuth}
          setOpenAuth={(value) =>
            onChangeShowAuth(
              typeof value === "function" ? value(showAuth) : value,
            )
          }
        />
      </Suspense>
    </>
  );
}

export default memo(HeaderClient);
