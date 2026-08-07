"use client";

// components
import SearchBox from "./components/SearchBox";
import SearchResults from "./components/SearchResults";
import { useEffect, useState } from "react";
import { API_SEARCH_CONTENTS } from "@/common/apiHandlers/(frontend)/apiLinks";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { SearchContentsType } from "./SearchContentUI";

export default function SearchContents({
  searchResults
}: {
  searchResults: { aiTags: string[]; categories: string[][] } | null;
}) {
  let selectedCity = null;
  try {
    const appState = useAppStates();
    selectedCity = appState?.location?.data?.selectedCity || null;
  } catch {
    selectedCity = null;
  }

  const [keyword, setKeyword] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [contents, setContents] = useState<SearchContentsType[]>([]);
  const [results, setResults] = useState<number[]>([]);

  useEffect(() => {
    const trimmedKey = keyword.trim();
    if (trimmedKey.length >= 2) {
      const cityId = selectedCity ? String(selectedCity._id) : "null";

      const timer = setTimeout(() => {
        fetch(
          `${API_SEARCH_CONTENTS}?cityId=${cityId}&key=${encodeURIComponent(trimmedKey)}&limit=25`,
          {
            cache: "default"
          }
        )
          .then(async (res) => await res.json())
          .then((data) => {
            if (data && Array.isArray(data.data)) {
              setContents(data.data);
              setResults(data.data.map((_: any, i: number) => i));
            } else {
              setContents([]);
              setResults([]);
            }
          })
          .catch(() => {
            setContents([]);
            setResults([]);
          });
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setContents([]);
      setResults([]);
    }
  }, [keyword, selectedCity]);

  return (
    <section
      className={`z-[999] absolute max-sm:hidden sm:w-[350px] -translate-x-[calc(50%_-_28px)] outline-none text-charcoal-3/90 backdrop-blur-md bg-ivory/80 rounded-xl w-fit py-2.5 px-4 text-base border border-charcoal-3/10 shadow-sm transition-all duration-300`}
    >
      <SearchBox
        keyword={keyword}
        onChangeKeyword={(updatedKeyword: string) => setKeyword(updatedKeyword)}
        isFocused={(focused: boolean) => setIsFocused(focused)}
      />
      {isFocused && (
        <SearchResults
          contents={contents}
          indices={results}
          aiTagsAndCategories={searchResults}
          collapse={() => {
            setIsFocused(false);
            setKeyword("");
          }}
        />
      )}
    </section>
  );
}
