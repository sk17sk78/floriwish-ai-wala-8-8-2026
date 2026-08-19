"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { SearchIcon, X, ArrowLeft } from "lucide-react";
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

  // Immediate 1-click focus on all devices without layout jump
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    });

    const timer = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 120);

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
    <section className="flex items-center gap-2.5 w-full bg-zinc-100 rounded-xl px-3.5 py-2 sm:py-2.5 border border-zinc-200/80 focus-within:border-[#b76e79] focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all shrink-0">
      <SearchIcon
        className="w-4 h-4 text-zinc-400 shrink-0"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        className="w-full outline-none bg-transparent text-[16px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 font-normal"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        type="text"
        name="search"
        placeholder="Search cakes, flowers, balloon decor, gifts..."
        value={keyword}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {keyword ? (
        <button
          type="button"
          onClick={() => onChangeKeyword("")}
          aria-label="Clear search"
          className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </section>
  );
}

export default memo(SearchBoxNew);
