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
  const trayId = useId();

  const noImage: boolean = Boolean(
    quickLinks.filter(({ image }) => !image).length
  );

  return (
    <div
      id={trayId || ""}
      className={`relative w-full transition-all duration-300 ${
        scrollable
          ? "flex flex-row flex-nowrap items-start justify-start max-sm:overflow-x-auto scrollbar-hide no-scrollbar max-sm:snap-x max-sm:snap-proximity max-sm:scroll-smooth gap-x-2.5 sm:gap-x-5 lg:gap-x-7 py-2.5 px-2.5 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible"
          : `grid ${
              quickLinks.length > 6
                ? "grid-cols-4 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-x-5 lg:gap-x-7"
                : "grid-cols-3 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-x-5 lg:gap-x-7"
            } gap-x-2.5 gap-y-2 sm:gap-y-4 py-2`
      }`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y"
      }}
    >
      {quickLinks.map((quickLink, i) => (
        <CategoryQuickLinkItem
          key={String(quickLink._id || i)}
          index={i}
          noImage={noImage}
          quickLink={quickLink}
          scrollable={scrollable}
        />
      ))}
    </div>
  );
}
