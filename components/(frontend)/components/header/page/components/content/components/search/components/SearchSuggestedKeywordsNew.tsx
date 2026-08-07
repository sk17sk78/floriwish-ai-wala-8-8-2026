// icons
import { Sparkles } from "lucide-react";

// utils
import { memo } from "react";

// components
import SearchSuggestedKeywordNew from "./SearchSuggestedKeywordNew";

// types
import { type SearchBarInitialContentsType } from "../../../../../Header";

function SearchSuggestedKeywordsNew({
  suggestedKeywords,
  onKeywordClick,
  collapse
}: {
  suggestedKeywords: SearchBarInitialContentsType["suggestedKeywords"];
  onKeywordClick: (keyword: string) => void;
  collapse: () => void;
}) {
  if (suggestedKeywords && suggestedKeywords.length > 0)
    return (
      <section className="flex flex-col gap-4 pb-2">
        <div className="flex items-center justify-start gap-3">
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-orange-50 text-orange-600">
            <Sparkles
              strokeWidth={2}
              width={18}
              height={18}
            />
          </div>
          <span className="text-[17px] text-charcoal-3/90 font-semibold tracking-tight">
            Suggested Search
          </span>
        </div>
        <section className="flex pt-0.5 gap-x-3 gap-y-3 items-start justify-start flex-wrap">
          {suggestedKeywords.map(({ label, path }, index) => (
            <SearchSuggestedKeywordNew
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

export default memo(SearchSuggestedKeywordsNew);
