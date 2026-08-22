"use client";

// constants
import { API_SEARCH_CONTENTS } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";

// utils
import { setLocalStorage } from "@/common/utils/storage/local";

// hooks
import { memo, useCallback, useEffect, useRef, useState } from "react";
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

function filterMatchingIndices(items: SearchContentsType[], query: string): number[] {
  if (!query.trim() || items.length === 0) return [];
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchingIndices: number[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const name = (item.name || "").toLowerCase();
    const slug = (item.slug || "").toLowerCase();
    const isMatch = terms.every((t) => name.includes(t) || slug.includes(t));
    if (isMatch) {
      matchingIndices.push(i);
    }
  }

  return matchingIndices;
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

  // Master product pool & client cache for instant 0ms responses
  const masterPoolRef = useRef<SearchContentsType[]>([]);
  const searchCacheRef = useRef<Map<string, SearchContentsType[]>>(new Map());
  const activeKeywordRef = useRef<string>("");

  // Helper to merge items into master pool without duplicates
  const mergeIntoMasterPool = useCallback((newItems: SearchContentsType[]) => {
    const existingSlugs = new Set(masterPoolRef.current.map((item) => item.slug));
    const toAdd = newItems.filter((item) => !existingSlugs.has(item.slug));
    if (toAdd.length > 0) {
      masterPoolRef.current = [...masterPoolRef.current, ...toAdd];
    }
  }, []);

  // Fetch from API
  const fetchCityWiseContentList = useCallback(
    async (searchKey?: string) => {
      const trimmedKey = (searchKey || "").trim();

      // Guard: If searchKey is stale compared to current input, ignore
      if (trimmedKey.toLowerCase() !== activeKeywordRef.current.trim().toLowerCase()) {
        return;
      }

      const cityId = selectedCity === null ? "null" : String(selectedCity._id);
      const url = new URL(API_SEARCH_CONTENTS);
      url.searchParams.set("cityId", cityId);

      const cacheKey = `${cityId}_${trimmedKey.toLowerCase()}`;

      if (trimmedKey) {
        url.searchParams.set("key", trimmedKey);
        url.searchParams.set("limit", "100");
      } else {
        url.searchParams.set("limit", "60");
      }

      // Check client memory cache
      if (searchCacheRef.current.has(cacheKey)) {
        if (trimmedKey.toLowerCase() !== activeKeywordRef.current.trim().toLowerCase()) {
          return;
        }
        const cached = searchCacheRef.current.get(cacheKey) || [];
        if (trimmedKey) {
          setContents(cached);
          setResults(cached.map((_, i) => i));
        } else {
          setContents([]);
          setResults([]);
        }
        setIsLoading(false);
        return;
      }

      // Only show loading if we don't have instant results already visible and keyword is present
      if (trimmedKey && masterPoolRef.current.length === 0) {
        setIsLoading(true);
      }

      try {
        const res = await fetch(url.toString(), {
          headers: {
            "x-api-key": XApiKey
          }
        });
        const data = await res.json();
        const newContents: SearchContentsType[] = data.data || [];

        searchCacheRef.current.set(cacheKey, newContents);
        mergeIntoMasterPool(newContents);

        // Guard: Discard stale response if user cleared or changed input while in-flight
        if (trimmedKey.toLowerCase() !== activeKeywordRef.current.trim().toLowerCase()) {
          return;
        }

        if (trimmedKey) {
          setContents(newContents);
          setResults(newContents.map((_, i) => i));
        } else {
          setContents([]);
          setResults([]);
        }

        setPrevCityId(selectedCity ? String(selectedCity._id) : null);
      } catch (err) {
        // Fallback to local pool filtering
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCity, mergeIntoMasterPool]
  );

  // Instant real-time search on keyword change
  const handleKeywordChange = useCallback(
    (newKeyword: string) => {
      activeKeywordRef.current = newKeyword;
      setKeyword(newKeyword);

      const trimmed = newKeyword.trim();
      if (!trimmed) {
        setResults([]);
        setContents([]);
        setIsLoading(false);
        return;
      }

      const cityId = selectedCity === null ? "null" : String(selectedCity._id);
      const cacheKey = `${cityId}_${trimmed.toLowerCase()}`;

      // 1. Instant Cache Hit (0ms)
      if (searchCacheRef.current.has(cacheKey)) {
        const cached = searchCacheRef.current.get(cacheKey) || [];
        setContents(cached);
        setResults(cached.map((_, i) => i));
        return;
      }

      // 2. Instant Client-Side Pool Filter (0ms)
      if (masterPoolRef.current.length > 0) {
        const matchedIndices = filterMatchingIndices(masterPoolRef.current, trimmed);
        if (matchedIndices.length > 0) {
          setContents(masterPoolRef.current);
          setResults(matchedIndices);
        }
      }
    },
    [selectedCity]
  );

  // Fast 120ms Debounced API fetch for deeper results
  useEffect(() => {
    activeKeywordRef.current = keyword;
    const trimmed = keyword.trim();
    if (trimmed.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchCityWiseContentList(trimmed);
      }, 120);
      return () => clearTimeout(timeoutId);
    } else {
      // Immediately reset when keyword is cleared
      setResults([]);
      setContents([]);
      setIsLoading(false);
    }
  }, [keyword, fetchCityWiseContentList]);

  useEffect(() => {
    if (hasFocused && keyword.trim().length === 0) {
      setResults([]);
      setContents([]);
      onLoadData();
    }
  }, [hasFocused, keyword, onLoadData]);

  useEffect(() => {
    if (
      hasFocused &&
      ((selectedCity !== null &&
        prevCityId !== null &&
        String(selectedCity._id) !== prevCityId) ||
        (selectedCity !== null && prevCityId === null) ||
        (selectedCity === null && prevCityId !== null))
    ) {
      searchCacheRef.current.clear();
      fetchCityWiseContentList(keyword.length > 0 ? keyword : undefined);
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
          onChangeKeyword={handleKeywordChange}
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
