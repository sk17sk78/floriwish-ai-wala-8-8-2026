"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { toSlug } from "@/common/utils/slugOperations";
import { useRouter } from "next/navigation";
import { type ChangeEvent } from "react";

function SearchBoxNew({
  keyword,
  onChangeKeyword,
  onChangeIsFocused,
  saveContentsToLS,
}: {
  keyword: string;
  onChangeKeyword: (keyword: string) => void;
  onChangeIsFocused: (isFocused: boolean) => void;
  saveContentsToLS: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useRouter();

  // Auto focus input cleanly
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      onChangeKeyword(value);
    },
    [onChangeKeyword]
  );

  const handleKeyDown = useCallback(
    ({ key }: { key: string }) => {
      if (key === "Enter" && keyword.trim()) {
        onChangeIsFocused(false);
        saveContentsToLS();
        push(`${FRONTEND_LINKS.SEARCH_PAGE}?key=${toSlug(keyword)}`);
        onChangeKeyword("");
      }

      if (key === "Escape") {
        onChangeIsFocused(false);
        onChangeKeyword("");
        inputRef.current?.blur();
      }
    },
    [onChangeIsFocused, keyword, onChangeKeyword, push, saveContentsToLS]
  );

  return (
    <div className="flex items-center gap-3 w-full min-w-0 shrink-0">
      <div className="flex-1 min-w-0 flex items-center bg-zinc-100 rounded-xl px-3.5 py-2.5 transition-all focus-within:bg-zinc-100/90 focus-within:ring-2 focus-within:ring-zinc-300">
        <Search className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
        <input
          ref={inputRef}
          className="w-full min-w-0 outline-none bg-transparent text-[15px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 font-normal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          type="text"
          name="search"
          placeholder="Search decorations, cakes, flowers..."
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {keyword && (
          <button
            type="button"
            onClick={() => onChangeKeyword("")}
            aria-label="Clear search"
            className="w-4.5 h-4.5 rounded-full bg-zinc-300 hover:bg-zinc-400 text-white flex items-center justify-center cursor-pointer shrink-0 ml-1.5 transition-colors"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChangeIsFocused(false)}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-1 py-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap active:scale-95"
      >
        Cancel
      </button>
    </div>
  );
}

export default memo(SearchBoxNew);
