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
  className
}: {
  showDrawer: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  return (
    <>
      <div
        onClick={() => onOpenChange(true)}
        className={
          className ||
          "flex flex-col items-center justify-center gap-0.5 cursor-pointer"
        }
      >
        <Shapes width={19} strokeWidth={showDrawer ? 2 : 1.5} height={19} />
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
