"use client";

// utils
import { memo } from "react";

// providers
import { LocationProvider } from "@/hooks/useLocation/useLocation";

// components
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import CityPopup from "./CityPopup";

function CityDrawer({
  showDrawer,
  onToggleShowDrawer,
}: {
  showDrawer: boolean;
  onToggleShowDrawer: (showDrawer: boolean) => void;
}) {
  return (
    <Drawer open={showDrawer} onOpenChange={onToggleShowDrawer}>
      <DrawerContent className="border-none outline-none p-0 rounded-t-[28px] max-h-[88dvh] bg-white z-[996] overflow-hidden shadow-2xl">
        <LocationProvider>
          <CityPopup
            closeDialog={() => {
              onToggleShowDrawer(false);
            }}
          />
        </LocationProvider>
      </DrawerContent>
    </Drawer>
  );
}

export default memo(CityDrawer);
