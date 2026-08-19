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
    selectedCity ? String(selectedCity._id) : null
  );

  // event handlers
  const fetchCityWiseContentList = useCallback((searchKey?: string) => {
    const url = new URL(API_SEARCH_CONTENTS);
    url.searchParams.set("cityId", selectedCity === null ? "null" : String(selectedCity._id));
    if (searchKey) {
      url.searchParams.set("key", searchKey);
      url.searchParams.set("limit", "100");
    } else {
      url.searchParams.set("limit", "40");
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
        
        if (searchKey) {
          setResults(() => newContents.map((_: any, i: number) => i));
        } else {
          setResults(() => []);
        }
        
        setPrevCityId(() =>
          selectedCity ? String(selectedCity._id) : null
        );
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [selectedCity]);

  // Debounced Search Logic
  useEffect(() => {
    if (keyword.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchCityWiseContentList(keyword);
      }, 400);
      return () => clearTimeout(timeoutId);
    } else if (keyword.length === 0 && hasFocused) {
      fetchCityWiseContentList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    if (hasFocused && keyword.length < 2) {
      fetchCityWiseContentList();
      onLoadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFocused]);

  useEffect(() => {
    if (
      hasFocused &&
      ((selectedCity !== null &&
        prevCityId !== null &&
        String(selectedCity._id) !== prevCityId) ||
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
    <div className="flex flex-col w-full h-full bg-white text-zinc-900 select-none overflow-hidden text-left">
      {/* ── Fixed Search Header ─────────────────────── */}
      <div className="px-4 sm:px-5 pt-[max(12px,env(safe-area-inset-top))] pb-3 sm:pt-4 sm:pb-3 border-b border-zinc-100 bg-white shrink-0 z-10 shadow-2xs">
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
      </div>

      {/* ── Scrollable Results Body ─────────────────── */}
      {isFocused && (
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-4 sm:px-5 py-4 pb-[max(24px,env(safe-area-inset-bottom))]">
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
