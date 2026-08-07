// icons
import { TrendingUp } from "lucide-react";

// utils
import { memo } from "react";

// components
import Link from "next/link";

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
    <article
      className="text-sm font-medium bg-ivory-2 text-charcoal-3/80 border border-charcoal-3/10 px-4 py-2 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white hover:border-charcoal-3/20 hover:shadow-premium flex items-center justify-start gap-2"
      onClick={onClick}
    >
      <span>{label}</span>
      <TrendingUp
        width={14}
        height={14}
        strokeWidth={2}
        className="text-charcoal-3/40"
      />
    </article>
  );
}

export default memo(SearchSuggestedKeywordNew);
