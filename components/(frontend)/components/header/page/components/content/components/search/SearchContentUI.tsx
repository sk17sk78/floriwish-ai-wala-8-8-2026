"use client";

// constants
import { API_SEARCH_CONTENTS } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";

// utils
import { setLocalStorage } from "@/common/utils/storage/local";

// hooks
import { memo, useCallback, useEffect, useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useSearch } from "@/hooks/useSearch/useSearch";

// icons
import { Sparkles, X } from "lucide-react";

// components
import SearchBoxNew from "./components/SearchBoxNew";
import SearchResultsNew from "./components/SearchResultsNew";

// types
import { SearchBarInitialContentsType } from "../../../../Header";

export type SearchContentsType = {
  name: string;
  slug: string;
  price: number;
  basePrice: number;
  mrp?: number;
  image: string;
  rating: number;
  ratingCount?: number;
  procTime?: number;
  tagInfo?: any;
  edible?: any[];
};

export function createKeywordRegex(keyword: string) {
  const safeKeyword = keyword || "";
  const escapedKeyword = safeKeyword.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");

  return new RegExp(escapedKeyword, "i");
}

function SearchContentUI({
  isFocused,
  searchResults,
  onChangeIsFocused
}: {
  isFocused: boolean;
  searchResults: SearchBarInitialContentsType | null;
  onChangeIsFocused: (isFocused: boolean) => void;
}) {
  // hooks
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();
  const { onShowSearchPage, onLoadData } = useSearch();

  // states
  const [keyword, setKeyword] = useState<string>("");
  const [hasFocused, setHasFocused] = useState<boolean>(false);
  const [contents, setContents] = useState<SearchContentsType[]>([]);
  const [results, setResults] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prevCityId, setPrevCityId] = useState<string | null>(
    selectedCity ? (String(selectedCity._id)) : null
  );

  // event handlers
  const fetchCityWiseContentList = useCallback((searchKey?: string) => {
    const url = new URL(API_SEARCH_CONTENTS);
    url.searchParams.set("cityId", selectedCity === null ? "null" : (String(selectedCity._id)));
    if (searchKey) {
      url.searchParams.set("key", searchKey);
      url.searchParams.set("limit", "100"); // Search results limit
    } else {
      url.searchParams.set("limit", "40"); // Default popular items limit
    }

    setIsLoading(true);
    fetch(url.toString(), {
      cache: "no-store",
      headers: {
        "x-api-key": XApiKey
      }
    })
      .then(async (res) => await res.json())
      .then((data) => {
        const newContents = data.data || [];
        setContents(() => newContents);
        
        // If we fetched with a key, all results are matching
        if (searchKey) {
          setResults(() => newContents.map((_: any, i: number) => i));
        } else {
          setResults(() => []);
        }
        
        setPrevCityId(() =>
          selectedCity ? (String(selectedCity._id)) : null
        );
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [selectedCity]);

  // Debounced Search Logic
  useEffect(() => {
    if (keyword.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchCityWiseContentList(keyword);
      }, 400); // 400ms debounce
      return () => clearTimeout(timeoutId);
    } else if (keyword.length === 0 && hasFocused) {
      // Fetch default items when empty
      fetchCityWiseContentList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    if (hasFocused && keyword.length < 2) {
      // fetch default contents from API here...
      fetchCityWiseContentList();
      onLoadData(); // Lazy load global search metadata (AI tags, categories, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFocused]);

  useEffect(() => {
    if (
      hasFocused &&
      ((selectedCity !== null &&
        prevCityId !== null &&
        (String(selectedCity._id)) !== prevCityId) ||
        (selectedCity !== null && prevCityId === null) ||
        (selectedCity === null && prevCityId !== null))
    ) {
      fetchCityWiseContentList(keyword.length >= 2 ? keyword : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  useEffect(() => {
    if (!hasFocused && isFocused) {
      setHasFocused(() => true);
    }
  }, [hasFocused, isFocused]);

  return (
    <div className="flex flex-col w-full h-full gap-y-3 overscroll-contain select-none">
      {/* Search Header */}
      <div className="flex items-center justify-between shrink-0 pb-1">
        <h2 className="text-[16px] font-bold text-zinc-900 tracking-tight">
          Search Products
        </h2>
        <button
          type="button"
          onClick={() => onChangeIsFocused(false)}
          className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <SearchBoxNew
        keyword={keyword}
        onChangeKeyword={(updatedKeyword: string) => {
          setKeyword(() => updatedKeyword);
        }}
        onChangeIsFocused={(isFocused: boolean) => {
          onChangeIsFocused(isFocused);
        }}
        saveContentsToLS={() => {
          setLocalStorage({ key: "items", value: contents });
        }}
      />

      {isFocused && (
        <div className="flex-1 overflow-y-auto overscroll-contain pb-6 scrollbar-thin scrollbar-thumb-zinc-200">
          <SearchResultsNew
            isLoading={isLoading}
            keyword={keyword}
            contents={contents}
            indices={results}
            aiTagsAndCategories={searchResults}
            onKeywordClick={(keyword: string) => {
              onShowSearchPage(keyword);
              onChangeIsFocused(false);
            }}
            collapse={() => {
              onChangeIsFocused(false);
              setKeyword(() => "");
            }}
          />
        </div>
      )}
    </div>
  );
}

export default memo(SearchContentUI);
