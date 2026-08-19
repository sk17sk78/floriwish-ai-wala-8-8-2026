// icons
import { Shapes } from "lucide-react";

// utils
import { memo } from "react";

// components
import CatalogueDrawerContent from "./CatalogueDrawerContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

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
          "flex flex-col items-center justify-center py-0.5 transition-all cursor-pointer group active:scale-95"
        }
      >
        <div
          className={cn(
            "px-4 py-0.5 rounded-full transition-all duration-200 flex items-center justify-center",
            showDrawer
              ? "bg-[#b76e79]/15 text-[#b76e79]"
              : "text-zinc-500 group-hover:text-zinc-800"
          )}
        >
          <Shapes width={20} strokeWidth={showDrawer ? 2.2 : 1.8} height={20} />
        </div>
        <span
          className={cn(
            "text-[10.5px] leading-tight mt-0.5 transition-colors",
            showDrawer
              ? "text-[#b76e79] font-bold"
              : "text-zinc-500 font-medium"
          )}
        >
          Categories
        </span>
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
