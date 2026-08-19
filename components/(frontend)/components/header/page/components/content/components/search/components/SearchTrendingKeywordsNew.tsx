"use client";

// utils
import { memo, useMemo } from "react";

// components
import SearchTrendingKeywordNew from "./SearchTrendingKeywordNew";

// types
import { type SearchBarInitialContentsType } from "../../../../../Header";

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
      <section className="flex flex-col gap-2.5 pb-2">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Trending
        </span>
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
