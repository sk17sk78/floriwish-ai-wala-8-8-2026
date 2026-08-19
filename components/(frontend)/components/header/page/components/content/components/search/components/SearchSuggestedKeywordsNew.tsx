// icons
import { Sparkles } from "lucide-react";

// utils
import { memo } from "react";

// components
import SearchSuggestedKeywordNew from "./SearchSuggestedKeywordNew";

// types
import { type SearchBarInitialContentsType } from "../../../../../Header";

import { useMemo } from "react";

function SearchSuggestedKeywordsNew({
  suggestedKeywords,
  onKeywordClick,
  collapse
}: {
  suggestedKeywords: SearchBarInitialContentsType["suggestedKeywords"];
  onKeywordClick: (keyword: string) => void;
  collapse: () => void;
}) {
  // Dynamically rotate list so the 1st category/keyword changes on each search view
  const items = useMemo(() => {
    if (!suggestedKeywords || suggestedKeywords.length <= 1) {
      return suggestedKeywords || [];
    }
    const offset = Math.floor(Math.random() * suggestedKeywords.length);
    return [
      ...suggestedKeywords.slice(offset),
      ...suggestedKeywords.slice(0, offset)
    ];
  }, [suggestedKeywords]);

  if (items && items.length > 0)
    return (
      <section className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-start gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Suggested Searches
          </span>
        </div>
        <section className="flex gap-2 items-start justify-start flex-wrap">
          {items.map(({ label, path }, index) => (
            <SearchSuggestedKeywordNew
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

export default memo(SearchSuggestedKeywordsNew);
