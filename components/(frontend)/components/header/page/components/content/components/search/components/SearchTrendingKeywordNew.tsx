"use client";

// icons
import { TrendingUp } from "lucide-react";

// utils
import { memo } from "react";

function SearchTrendingKeywordNew({
  label,
  path,
  onClick
}: {
  label: string;
  path: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 hover:border-[#b76e79]/60 hover:bg-rose-50/40 px-3.5 py-2 rounded-full cursor-pointer transition-all duration-150 active:scale-95 flex items-center justify-start gap-1.5 shadow-2xs min-w-0 truncate"
      onClick={onClick}
    >
      <TrendingUp
        width={13}
        height={13}
        strokeWidth={2.2}
        className="text-[#b76e79] shrink-0"
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default memo(SearchTrendingKeywordNew);
