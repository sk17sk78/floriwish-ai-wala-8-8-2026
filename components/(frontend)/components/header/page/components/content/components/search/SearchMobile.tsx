"use client";

// icons
import { Search } from "lucide-react";

// utils
import { memo, useState, useCallback } from "react";

// components
import SearchContentDrawer from "./SearchContentDrawer";

// types
import { type SearchBarInitialContentsType } from "../../../../Header";

function SearchMobile({
  searchResults
}: {
  searchResults: SearchBarInitialContentsType | null;
}) {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setIsFocused(true);
  }, []);

  return (
    <div className="lg:hidden flex items-center">
      <button
        type="button"
        aria-label="Search Products"
        onClick={handleOpen}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer hover:bg-charcoal-3/5 active:scale-95 text-charcoal-3/70 hover:text-charcoal-3/90 touch-manipulation focus:outline-none select-none"
      >
        <Search className="w-5 h-5 pointer-events-none" strokeWidth={1.75} />
      </button>
      <SearchContentDrawer
        isFocused={isFocused}
        searchResults={searchResults}
        onChangeIsFocused={setIsFocused}
      />
    </div>
  );
}

export default memo(SearchMobile);
