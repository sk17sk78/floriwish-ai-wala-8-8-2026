// icons
import { Flame } from "lucide-react";

// utils
import { memo } from "react";

// components
import SearchTrendingKeywordNew from "./SearchTrendingKeywordNew";

// types
import { type SearchBarInitialContentsType } from "../../../../../Header";

import { useMemo } from "react";

function SearchTrendingKeywordsNew({
  trendingKeywords,
  onKeywordClick,
  collapse
}: {
  trendingKeywords: SearchBarInitialContentsType["trendingKeywords"];
  onKeywordClick: (keyword: string) => void;
  collapse: () => void;
}) {
  // Dynamically rotate list so the 1st trending keyword changes on each search view
  const items = useMemo(() => {
    if (!trendingKeywords || trendingKeywords.length <= 1) {
      return trendingKeywords || [];
    }
    const offset = Math.floor(Math.random() * trendingKeywords.length);
    return [
      ...trendingKeywords.slice(offset),
      ...trendingKeywords.slice(0, offset)
    ];
  }, [trendingKeywords]);

  if (items && items.length > 0)
    return (
      <section className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-start gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Trending Searches
          </span>
        </div>
        <section className="flex gap-2 items-start justify-start flex-wrap">
          {items.map(({ label, path }, index) => (
            <SearchTrendingKeywordNew
              key={`${label}-${index}`}
              label={label}
              path={path}
              onClick={() => {
                onKeywordClick(label);
              }}
            />
          ))}
        </section>
      </section>
    );

  return <></>;
}

export default memo(SearchTrendingKeywordsNew);
