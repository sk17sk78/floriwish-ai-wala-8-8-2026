// icons
import { Flame } from "lucide-react";

// utils
import { memo } from "react";

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
  if (trendingKeywords && trendingKeywords.length > 0)
    return (
      <section className="flex flex-col gap-4 pb-2">
        <div className="flex items-center justify-start gap-3">
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 text-red-600">
            <Flame
              strokeWidth={2}
              width={18}
              height={18}
            />
          </div>
          <span className="text-[17px] text-charcoal-3/90 font-semibold tracking-tight">
            Trending Searches
          </span>
        </div>
        <section className="flex pt-0.5 gap-x-3 gap-y-3 items-start justify-start flex-wrap">
          {trendingKeywords.map(({ label, path }, index) => (
            <SearchTrendingKeywordNew
              key={index}
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
