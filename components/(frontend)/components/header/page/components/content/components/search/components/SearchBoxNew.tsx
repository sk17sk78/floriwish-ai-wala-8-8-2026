// icons
import { SearchIcon, X } from "lucide-react";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { memo } from "react";
import { toSlug } from "@/common/utils/slugOperations";

// hooks
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// types
import { type ChangeEvent } from "react";

function SearchBoxNew({
  keyword,
  onChangeKeyword,
  onChangeIsFocused,
  saveContentsToLS
}: {
  keyword: string;
  onChangeKeyword: (keyword: string) => void;
  onChangeIsFocused: (isFocused: boolean) => void;
  saveContentsToLS: () => void;
}) {
  // hooks
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useRouter();


  // event handlers
  const handleChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      onChangeKeyword(value);
    },
    [onChangeKeyword]
  );

  const handleFocus = useCallback(() => {
    onChangeIsFocused(true);
  }, [onChangeIsFocused]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      onChangeIsFocused(false);
    }, 250);
  }, [onChangeIsFocused]);

  const handleKeyDown = useCallback(
    ({ key }: { key: string }) => {
      if (key === "Enter") {
        onChangeIsFocused(false);
        saveContentsToLS();
        push(`${FRONTEND_LINKS.SEARCH_PAGE}?key=${toSlug(keyword)}`);
        onChangeKeyword("");
      }

      if (key === "Escape") {
        onChangeIsFocused(false);
        onChangeKeyword("");
        if (inputRef.current)
          // @ts-ignore
          inputRef.current.blur();
      }
    },
    [onChangeIsFocused, keyword, onChangeKeyword, push, saveContentsToLS]
  );

  return (
    <section className="flex items-center justify-start gap-3.5 bg-white border border-charcoal-3/15 text-charcoal-3/80 lg:w-full lg:min-h-[54px] lg:px-4 max-lg:px-4 max-lg:py-3.5 lg:rounded-2xl max-lg:rounded-2xl transition-all duration-300 focus-within:border-charcoal-3/30 focus-within:shadow-premium max-lg:mb-1.5 group">
      <SearchIcon
        width={20}
        height={20}
        strokeWidth={1.5}
        className="group-focus-within:text-charcoal-3/90 transition-colors duration-300"
      />
      <input
        ref={inputRef}
        autoFocus
        className="w-full outline-none focus:outline-none bg-transparent text-[17px] placeholder:text-charcoal-3/50"
        autoComplete="off"
        type="text"
        name="search"
        placeholder="Search for cakes, flowers, gifts..."
        value={keyword}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      <X
        className={`${keyword ? "opacity-100" : "opacity-0 pointer-events-none"} transition-all duration-200 cursor-pointer hover:bg-charcoal-3/5 rounded-full p-0.5`}
        width={20}
        height={20}
        strokeWidth={1.5}
        onClick={() => {
          onChangeKeyword("");
        }}
      />
    </section>
  );
}

export default memo(SearchBoxNew);
