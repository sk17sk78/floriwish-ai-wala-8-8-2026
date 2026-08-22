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
        <SheetContent
          side="bottom"
          className="h-[85dvh] max-h-[85dvh] w-full rounded-t-3xl border-t border-zinc-200/80 bg-white p-0 shadow-2xl z-[99999] duration-300 ease-out focus:outline-none overflow-hidden"
        >
          <CatalogueDrawerContent
            onClose={() => {
              onOpenChange(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export default memo(CatalogueDrawer);
