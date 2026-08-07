// utils
import { lazy, memo, useState } from "react";

import { ChevronDown } from "lucide-react";
// components
const LazyHeaderNavMenuContent = lazy(() => import("./HeaderNavMenuContent"));
import { Suspense } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

function HeaderNavMenu({
  navLink: { label, sections, quickLinks },
}: {
  navLink: HeaderNavLinkDocument;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <section
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative"
    >
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 text-[14px] font-medium ${
          open ? "bg-[#fff5f8] text-moss" : "text-zinc-700 hover:bg-pink-50 hover:text-moss"
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180 text-moss" : ""}`}
        />
      </div>
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${!open ? "opacity-0 translate-y-2 pointer-events-none" : "opacity-100 translate-y-0"}`}
      >
        <Suspense>
          <LazyHeaderNavMenuContent
            sections={sections}
            quickLinks={quickLinks}
          />
        </Suspense>
      </div>
    </section>
  );

  return (
    <TooltipProvider delayDuration={50} skipDelayDuration={0}>
      <Tooltip
        defaultOpen={false}
        delayDuration={50}
        open={open}
        onOpenChange={setOpen}
      >
        <TooltipTrigger
          onClick={() => setOpen((prev) => !prev)}
          className="font-medium text-[15px] text-charcoal/90 transition-all duration-300 hover:text-sienna cursor-pointer"
        >
          {label}
        </TooltipTrigger>
        <Suspense>
          <LazyHeaderNavMenuContent
            sections={sections}
            quickLinks={quickLinks}
          />
        </Suspense>
      </Tooltip>
    </TooltipProvider>
  );
}

export default memo(HeaderNavMenu);
