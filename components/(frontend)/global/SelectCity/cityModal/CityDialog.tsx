// utils
import { memo } from "react";

// providers
import { LocationProvider } from "@/hooks/useLocation/useLocation";

// components
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CityPopup from "./CityPopup";

function CityDialog({
  showDialog,
  onToggleShowDialog,
}: {
  showDialog: boolean;
  onToggleShowDialog: (showDialog: boolean) => void;
}) {
  return (
    <Dialog open={showDialog} onOpenChange={onToggleShowDialog}>
      <DialogContent
        className="sm:max-w-[460px] w-full border-none outline-none p-0 rounded-3xl overflow-hidden bg-white shadow-2xl [&>button]:hidden"
      >
        <DialogTitle className="hidden">Select City</DialogTitle>
        <LocationProvider>
          <CityPopup
            closeDialog={() => {
              onToggleShowDialog(false);
            }}
          />
        </LocationProvider>
      </DialogContent>
    </Dialog>
  );
}

export default memo(CityDialog);
