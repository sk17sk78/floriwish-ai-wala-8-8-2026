"use client";

// icons
import { Search } from "lucide-react";

// utils
import { memo } from "react";

// hooks
import { useState } from "react";

// components
import SearchContentDialog from "./SearchContentDialog";

// types
import { type SearchBarInitialContentsType } from "../../../../Header";

function SearchDesktop({
  searchResults,
}: {
  searchResults: SearchBarInitialContentsType | null;
}) {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <>
      <div
        className="z-20 max-lg:hidden absolute top-0.5 left-1/2 -translate-x-1/2"
        onClick={() => {
          setIsFocused(true);
        }}
      >
        <section
          className={`z-[999] absolute max-lg:hidden lg:min-w-[380px] xl:min-w-[480px] -translate-x-1/2 outline-none text-charcoal-3/90 backdrop-blur-md bg-white/90 rounded-full w-fit py-2 px-5 text-base border border-charcoal-3/15 shadow-sm transition-all duration-300 hover:border-charcoal-3/25`}
        >
          {
            <section className="flex items-center justify-start lg:justify-between gap-3 text-charcoal-3/80 bg-transparent transition-all duration-300">
              <Search
                width={18}
                height={18}
                strokeWidth={2}
                className="text-charcoal-3/80"
              />
              <input
                className="flex-1 outline-none focus:outline-none bg-transparent text-sm placeholder:text-charcoal-3/70 ml-1"
                autoComplete="off"
                type="text"
                name="search"
                placeholder="Search for cakes, flowers, gifts..."
                readOnly
              />
              <div className="hidden lg:flex items-center justify-center border border-charcoal-3/20 rounded-md px-1.5 py-0.5 bg-ash-1/10 text-[10px] font-bold text-charcoal-3/75 shadow-sm ml-2">
                ⌘K
              </div>
            </section>
          }
        </section>
      </div>
      <SearchContentDialog
        isFocused={isFocused}
        searchResults={searchResults}
        onChangeIsFocused={setIsFocused}
      />
    </>
  );
}

export default memo(SearchDesktop);
