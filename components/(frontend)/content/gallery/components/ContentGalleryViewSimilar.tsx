// icons
import { Tag } from "lucide-react";

// utils
import { memo } from "react";

function ContentGalleryViewSimilar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute bottom-5 right-5 hidden sm:flex h-11 w-11 items-center justify-center gap-0 overflow-hidden rounded-full bg-charcoal-3/70 text-white shadow-[0_18px_36px_rgba(17,24,39,0.25)] backdrop-blur-md transition-all duration-500 hover:w-28 hover:gap-2 hover:bg-charcoal-3/85"
      aria-label="View similar products"
    >
      <Tag
        strokeWidth={2.5}
        width={18}
        height={18}
        className="-rotate-90 shrink-0"
      />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-bold tracking-tight opacity-0 transition-all duration-500 group-hover:max-w-xs group-hover:opacity-100">
        Similar
      </span>
    </button>
  );
}

export default memo(ContentGalleryViewSimilar);
