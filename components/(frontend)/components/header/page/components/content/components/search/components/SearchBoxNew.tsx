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

  // Immediate 1-click focus with preventScroll
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    const timer = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
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
    <div className="flex items-center gap-2.5 w-full min-w-0 shrink-0">
      <div className="flex-1 min-w-0 flex items-center rounded-2xl bg-[#f4f4f5] px-2.5 py-1.5 border border-transparent focus-within:border-[#b76e79]/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100/80 transition-all">
        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#b76e79] mr-2 shrink-0">
          <Search className="w-4 h-4 text-[#b76e79]" strokeWidth={2.2} />
        </div>
        <input
          ref={inputRef}
          className="w-full min-w-0 outline-none bg-transparent text-[15px] text-zinc-900 placeholder:text-zinc-400 font-normal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          type="text"
          name="search"
          placeholder="Search decorations, occasions, gifts..."
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {keyword && (
          <button
            type="button"
            onClick={() => onChangeKeyword("")}
            aria-label="Clear search"
            className="w-5 h-5 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center cursor-pointer shrink-0 ml-1.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChangeIsFocused(false)}
        className="text-sm font-semibold text-[#b76e79] hover:text-[#96555f] px-1 py-1 cursor-pointer transition-colors shrink-0 whitespace-nowrap active:scale-95"
      >
        Cancel
      </button>
    </div>
  );
}

export default memo(SearchBoxNew);
