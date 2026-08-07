"use client";

// icons
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// hooks
import { useCallback, useId } from "react";
import { useWindowSize } from "usehooks-ts";

// components
import CategoryQuickLinkItem from "./CategoryQuickLinkItem";

// types
import { type ClickableImageDocument } from "@/common/types/documentation/nestedDocuments/clickableImage";

export default function CategoryQuickLinks({
  quickLinks,
  scrollable
}: {
  quickLinks: ClickableImageDocument[];
  scrollable?: boolean;
}) {
  // hooks
  const trayId = useId();
  const { width } = useWindowSize();

  // memoizes
  const noImage: boolean = Boolean(
    quickLinks.filter(({ image }) => !image).length
  );

  // event handlers
  const handleScroll = useCallback(
    (dir: "left" | "right") => {
      const tray = document.getElementById(trayId) as HTMLElement;

      const currOffset = tray.scrollLeft;

      tray.scrollTo({
        left: currOffset + (dir === "left" ? -1 : 1) * (width * 0.65),
        behavior: "smooth"
      });
    },
    [trayId, width]
  );

  return (
    <div
      id={trayId || ""}
      className={`relative w-full transition-all duration-300 ${!!scrollable ? "flex flex-row flex-nowrap items-start justify-start overflow-x-auto scrollbar-hide no-scrollbar gap-x-3.5 py-4 px-2" : `grid ${quickLinks.length > 6 ? "grid-cols-4 sm:grid-cols-4 lg:flex lg:items-start lg:justify-start lg:gap-x-7" : "grid-cols-3 sm:grid sm:grid-cols-6 sm:px-4 sm:gap-x-6 lg:gap-x-12"} overflow-auto gap-x-3.5 gap-y-1 sm:gap-y-2.5 max-sm:border-b max-sm:pb-4`}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {quickLinks.map((quickLink, i) => (
        <CategoryQuickLinkItem
          key={String(quickLink._id)}
          index={i}
          noImage={noImage}
          quickLink={quickLink}
          scrollable={scrollable}
        />
      ))}
    </div>
  );
}
