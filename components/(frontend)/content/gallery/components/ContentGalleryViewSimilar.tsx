"use client";

// icons
import { Tag } from "lucide-react";

// utils
import { memo } from "react";

function ContentGalleryViewSimilar({
  onClick
}: {
  onClick?: () => void;
  categoryUrl?: string;
}) {
  const commonClasses =
    "group absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-5 lg:right-5 z-[60] flex items-center justify-center gap-1.5 h-8 sm:h-9 lg:h-10 px-2.5 sm:px-3.5 rounded-full bg-charcoal-3/85 hover:bg-charcoal-3 text-white shadow-[0_12px_28px_rgba(17,24,39,0.25)] backdrop-blur-md transition-all duration-300 active:scale-95 cursor-pointer pointer-events-auto select-none";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={commonClasses}
      aria-label="View similar products"
    >
      <Tag
        strokeWidth={2.5}
        width={15}
        height={15}
        className="-rotate-90 shrink-0 sm:w-4 sm:h-4"
      />
      <span className="text-[11px] sm:text-xs lg:text-[13px] font-semibold tracking-tight whitespace-nowrap">
        Similar
      </span>
    </button>
  );
}

export default memo(ContentGalleryViewSimilar);
