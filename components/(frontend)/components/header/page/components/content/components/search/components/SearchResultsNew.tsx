// utils
import { memo } from "react";

// components
import SearchResultContentCategoriesAITagsNew from "./SearchResultContentCategoriesAITagsNew";
import SearchResultContentsNew from "./SearchResultContentsNew";
import SearchTrendingKeywordsNew from "./SearchTrendingKeywordsNew";
import SearchSuggestedKeywordsNew from "./SearchSuggestedKeywordsNew";

// types
import { type SearchBarInitialContentsType } from "../../../../../Header";
import { type SearchContentsType } from "../SearchContentUI";

function SearchResultsNew({
  isLoading,
  keyword,
  aiTagsAndCategories,
  contents,
  indices,
  onKeywordClick,
  collapse
}: {
  isLoading: boolean;
  keyword: string;
  aiTagsAndCategories: SearchBarInitialContentsType | null;
  contents: SearchContentsType[];
  indices: number[];
  onKeywordClick: (keyword: string) => void;
  collapse: () => void;
}) {
  if (isLoading && keyword.length >= 2) {
    return (
      <div className="flex flex-col gap-4 py-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-14 w-14 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex flex-col gap-2 w-full pt-1">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return indices.length > 0 ? (
    <>
      <SearchResultContentCategoriesAITagsNew
        categories={aiTagsAndCategories?.categories || []}
        aiTags={aiTagsAndCategories?.aiTags || []}
        collapse={collapse}
      />
      <SearchResultContentsNew
        contents={contents}
        indices={indices}
        collapse={collapse}
      />
    </>
  ) : (
    <>
      <SearchTrendingKeywordsNew
        trendingKeywords={aiTagsAndCategories?.trendingKeywords || []}
        onKeywordClick={onKeywordClick}
        collapse={collapse}
      />
      <SearchSuggestedKeywordsNew
        suggestedKeywords={aiTagsAndCategories?.suggestedKeywords || []}
        onKeywordClick={onKeywordClick}
        collapse={collapse}
      />
    </>
  );
}

export default memo(SearchResultsNew);
