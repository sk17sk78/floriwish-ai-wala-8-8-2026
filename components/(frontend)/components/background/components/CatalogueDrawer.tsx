// icons
import { Shapes } from "lucide-react";

// utils
import { memo } from "react";

// components
import CatalogueDrawerContent from "./CatalogueDrawerContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function CatalogueDrawer({
  showDrawer,
  onOpenChange,
}: {
  showDrawer: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      {/* 1. Removed the showDrawer ? "hidden" : "" logic.
        2. Added cursor-pointer so it feels like a button. 
      */}
      <div
        onClick={() => onOpenChange(true)}
        className="flex flex-col items-center justify-center gap-0.5 cursor-pointer"
      >
        <Shapes width={18} strokeWidth={1.5} height={18} />
        <span>Categories</span>
      </div>

      <Sheet open={showDrawer} onOpenChange={onOpenChange}>
        <SheetContent className="h-device w-device z-[900] !px-4 duration-300 ease-in-out">
          <div className="h-device text-charcoal-2 bg-ivory-1 w-full transition-all duration-300 overflow-auto grid grid-cols-1 auto-rows-min">
            <CatalogueDrawerContent
              onClose={() => {
                onOpenChange(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default memo(CatalogueDrawer);
