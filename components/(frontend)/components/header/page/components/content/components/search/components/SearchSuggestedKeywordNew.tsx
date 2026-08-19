"use client";

// icons
import { Search } from "lucide-react";

// utils
import { memo } from "react";

function SearchSuggestedKeywordNew({
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
      className="text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 px-3 py-1.5 rounded-full cursor-pointer transition-colors active:scale-95 flex items-center justify-start gap-1.5 min-w-0"
      onClick={onClick}
    >
      <Search
        width={12}
        height={12}
        className="text-zinc-400 shrink-0"
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default memo(SearchSuggestedKeywordNew);
