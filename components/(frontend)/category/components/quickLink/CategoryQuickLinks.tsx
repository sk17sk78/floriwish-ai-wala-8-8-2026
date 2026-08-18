"use client";

// icons
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// hooks
import { useCallback, useEffect, useRef } from "react";

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
  const trayRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isAutoSlider = quickLinks.length > 8;

  const noImage: boolean = Boolean(
    quickLinks.filter(({ image }) => !image).length
  );

  const handleScroll = useCallback((dir: "left" | "right") => {
    const tray = trayRef.current;
    if (!tray) return;
    tray.scrollBy({
      left: (dir === "left" ? -1 : 1) * (tray.offsetWidth * 0.7 || 300),
      behavior: "smooth"
    });
  }, []);

  // Auto slider when > 8 items on all devices
  useEffect(() => {
    if (!isAutoSlider) return;
    const tray = trayRef.current;
    if (!tray) return;

    const interval = setInterval(() => {
      if (isHoveredRef.current) return;
      const maxScroll = tray.scrollWidth - tray.clientWidth;
      if (tray.scrollLeft >= maxScroll - 10) {
        tray.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        tray.scrollBy({ left: 180, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoSlider]);

  return (
    <div className="relative w-full group/quicklinksslider">
      {/* Left Arrow */}
      {(isAutoSlider || quickLinks.length > 4) && (
        <button
          type="button"
          aria-label="Previous"
          onClick={() => handleScroll("left")}
          className="max-sm:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-slate-900 shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95"
        >
          <ChevronLeftIcon size={18} />
        </button>
      )}

      <div
        ref={trayRef}
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
        onTouchStart={() => { isHoveredRef.current = true; }}
        onTouchEnd={() => { setTimeout(() => { isHoveredRef.current = false; }, 2500); }}
        className={`relative w-full transition-all duration-300 scroll-smooth ${
          isAutoSlider || scrollable
            ? "flex flex-row flex-nowrap items-start justify-start overflow-x-auto scrollbar-hide no-scrollbar snap-x snap-proximity gap-x-2.5 sm:gap-x-5 lg:gap-x-7 py-2.5 px-2.5 sm:px-0"
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
            scrollable={isAutoSlider || scrollable}
          />
        ))}
      </div>

      {/* Right Arrow */}
      {(isAutoSlider || quickLinks.length > 4) && (
        <button
          type="button"
          aria-label="Next"
          onClick={() => handleScroll("right")}
          className="max-sm:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer flex items-center justify-center bg-white/90 backdrop-blur-sm border border-neutral-200 text-slate-900 shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95"
        >
          <ChevronRightIcon size={18} />
        </button>
      )}
    </div>
  );
}
