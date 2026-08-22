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
  const hasKeyword = keyword.trim().length > 0;

  if (isLoading && hasKeyword && indices.length === 0) {
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

  // 1. If no search keyword, ALWAYS show trending and suggested keywords
  if (!hasKeyword) {
    return (
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

  // 2. Keyword is present and matches were found
  if (indices.length > 0) {
    return (
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
    );
  }

  // 3. Keyword is present but no products match
  return (
    <div className="py-8 text-center">
      <p className="text-zinc-500 text-sm">
        No results found for &ldquo;<span className="font-semibold text-zinc-800">{keyword.trim()}</span>&rdquo;
      </p>
      <p className="text-zinc-400 text-xs mt-1">
        Try checking your spelling or search for flowers, cakes, balloons, or gifts.
      </p>
      <div className="mt-6 text-left">
        <SearchTrendingKeywordsNew
          trendingKeywords={aiTagsAndCategories?.trendingKeywords || []}
          onKeywordClick={onKeywordClick}
          collapse={collapse}
        />
      </div>
    </div>
  );
}

export default memo(SearchResultsNew);
