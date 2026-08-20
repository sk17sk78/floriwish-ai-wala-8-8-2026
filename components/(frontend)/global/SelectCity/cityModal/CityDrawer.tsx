"use client";

// utils
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// providers
import { LocationProvider } from "@/hooks/useLocation/useLocation";

// components
import CityPopup from "./CityPopup";

function CityDrawer({
  showDrawer,
  onToggleShowDrawer,
}: {
  showDrawer: boolean;
  onToggleShowDrawer: (showDrawer: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!showDrawer || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => onToggleShowDrawer(false)}
      />

      {/* Full screen on mobile (100dvh, w-full, rounded-none), sleek compact modal on laptop/desktop */}
      <div className="
        relative z-10 flex flex-col overflow-hidden shadow-2xl
        animate-in slide-in-from-bottom duration-250
        bg-white
        w-full h-full max-h-[100dvh] rounded-none
        sm:w-[430px] sm:h-[540px] sm:max-h-[85vh] sm:rounded-2xl sm:mx-auto
      ">
        <LocationProvider>
          <CityPopup
            closeDialog={() => {
              onToggleShowDrawer(false);
            }}
          />
        </LocationProvider>
      </div>
    </div>,
    document.body
  );
}

export default memo(CityDrawer);
