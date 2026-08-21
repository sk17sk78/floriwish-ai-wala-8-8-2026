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
import { memo, useMemo } from "react";
import CatalogueDrawer from "../background/components/CatalogueDrawer";
import { INSTAGRAM_LINK } from "@/common/constants/companyDetails";
import { SearchBarInitialContentsType } from "../header/page/Header";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <nav
        role="navigation"
        aria-label="Mobile Navigation"
        className={`fixed bottom-0 left-0 right-0 w-full grid grid-cols-4 items-center text-center pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] z-50 bg-white/80 backdrop-blur-2xl backdrop-saturate-180 border-t border-zinc-200/60 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] lg:hidden transition-all duration-300 ease-out transform select-none ${
          isAnySidebarOpen
            ? "translate-y-24 opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        {/* 1. Home Tab */}
        <Link href={"/"} aria-label="Home" className="focus:outline-none">
          <div className="flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95">
            <div
              className={cn(
                "px-4 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center",
                isHomeActive
                  ? "bg-[#b76e79]/15 text-[#b76e79]"
                  : "text-zinc-500 group-hover:text-zinc-800"
              )}
            >
              <Home
                strokeWidth={isHomeActive ? 2.2 : 1.8}
                className="w-5 h-5 transition-transform duration-200"
              />
            </div>
            <span
              className={cn(
                "text-[10.5px] leading-tight mt-0.5 transition-colors",
                isHomeActive
                  ? "text-[#b76e79] font-bold"
                  : "text-zinc-500 font-medium"
              )}
            >
              Home
            </span>
          </div>
        </Link>

        {/* 2. Categories Tab */}
        <CatalogueDrawer
          showDrawer={activeSidebar === "categories"}
          onOpenChange={(isOpen) =>
            onChangeActiveSidebar(isOpen ? "categories" : null)
          }
          className="flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95"
        />

        {/* 3. Instagram Tab */}
        <Link
          target="_blank"
              rel="noopener noreferrer"
          href={INSTAGRAM_LINK}
          aria-label="Instagram"
          className="focus:outline-none"
        >
          <div className="flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95">
            <div className="px-4 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center text-zinc-500 group-hover:text-zinc-800">
              <Instagram
                strokeWidth={1.8}
                className="w-5 h-5 transition-transform duration-200"
              />
            </div>
            <span className="text-[10.5px] leading-tight mt-0.5 text-zinc-500 font-medium">
              Instagram
            </span>
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
            <div className="flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95">
              <div
                className={cn(
                  "px-4 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center",
                  isDashboardActive
                    ? "bg-[#b76e79]/15 text-[#b76e79]"
                    : "text-zinc-500 group-hover:text-zinc-800"
                )}
              >
                <div className="w-5 h-5 rounded-full bg-[#b76e79]/10 border border-[#b76e79]/30 flex items-center justify-center text-[10px] text-[#b76e79] font-bold">
                  {userName?.slice(0, 1).toUpperCase() || <User className="w-3 h-3" />}
                </div>
              </div>
              <span
                className={cn(
                  "text-[10.5px] leading-tight mt-0.5 truncate max-w-[64px] transition-colors",
                  isDashboardActive
                    ? "text-[#b76e79] font-bold"
                    : "text-zinc-500 font-medium"
                )}
              >
                {userNameToShow}
              </span>
            </div>
          </Link>
        ) : (
          <div
            onClick={() => onChangeShowAuth(true)}
            className="flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95"
          >
            <div
              className={cn(
                "px-4 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center",
                showAuth
                  ? "bg-[#b76e79]/15 text-[#b76e79]"
                  : "text-zinc-500 group-hover:text-zinc-800"
              )}
            >
              <LogIn
                strokeWidth={1.8}
                className="w-5 h-5 transition-transform duration-200"
              />
            </div>
            <span
              className={cn(
                "text-[10.5px] leading-tight mt-0.5 transition-colors",
                showAuth
                  ? "text-[#b76e79] font-bold"
                  : "text-zinc-500 font-medium"
              )}
            >
              Login
            </span>
          </div>
        )}
      </nav>
    </>
  );
}

export default memo(MobileNavbar);
