"use client";

// icons
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// hooks
import { useCallback, useEffect, useRef } from "react";

// components
import CategoryRelatedCategoryItem from "./CategoryRelatedCategoryItem";

// types
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";

export default function CategoryRelatedCategories({
  categories
}: {
  categories: ContentCategoryDocument[];
}) {
  const trayRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isAutoSlider = categories.length > 8;

  const handleScroll = useCallback((dir: "left" | "right") => {
    const tray = trayRef.current;
    if (!tray) return;
    tray.scrollBy({
      left: (dir === "left" ? -1 : 1) * (tray.offsetWidth * 0.7 || 300),
      behavior: "smooth"
    });
  }, []);

  // Auto slider when > 8 items on all devices (deferred to idle)
  useEffect(() => {
    if (!isAutoSlider) return;
    const tray = trayRef.current;
    if (!tray) return;

    let interval: NodeJS.Timeout | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const startSlider = () => {
      interval = setInterval(() => {
        if (isHoveredRef.current || !tray) return;
        const maxScroll = tray.scrollWidth - tray.clientWidth;
        if (tray.scrollLeft >= maxScroll - 10) {
          tray.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          tray.scrollBy({ left: 220, behavior: "smooth" });
        }
      }, 4000);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(startSlider, { timeout: 3000 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleId);
        }
        if (interval) clearInterval(interval);
      };
    } else {
      timerId = setTimeout(startSlider, 2500);
      return () => {
        if (timerId) clearTimeout(timerId);
        if (interval) clearInterval(interval);
      };
    }
  }, [isAutoSlider]);

  return (
    <div className="relative w-full group/relatedslider">
      {/* Left Arrow */}
      {categories.length > 4 && (
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
        className="relative flex items-start justify-start overflow-auto gap-x-5 gap-y-4 sm:gap-x-4 sm:gap-y-8 max-sm:px-4 sm:py-3 pl-3 w-full transition-all duration-300 scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y"
        }}
      >
        {categories.map((category, i) => (
          <CategoryRelatedCategoryItem
            key={String(category._id)}
            index={i}
            category={category}
          />
        ))}
      </div>

      {/* Right Arrow */}
      {categories.length > 4 && (
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
