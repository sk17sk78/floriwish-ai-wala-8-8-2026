"use client";

// utils
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// components
import SearchContentUI from "./SearchContentUI";

// types
import { type SearchBarInitialContentsType } from "../../../../Header";

function SearchContentDrawer({
  isFocused,
  searchResults,
  onChangeIsFocused
}: {
  isFocused: boolean;
  searchResults: SearchBarInitialContentsType | null;
  onChangeIsFocused: (isFocused: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isFocused || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => onChangeIsFocused(false)}
      />

      {/* Mobile (<640px): 100% full-screen app view | Tablet / iPad (640px-1024px): responsive centered modal */}
      <div className="
        relative z-10 flex flex-col overflow-hidden shadow-2xl
        animate-in slide-in-from-bottom duration-250
        bg-white
        w-full h-[100dvh] max-h-[100dvh] rounded-none
        sm:w-[540px] sm:h-[82dvh] sm:max-h-[750px] sm:rounded-3xl sm:mx-auto
      ">
        <SearchContentUI
          isFocused={isFocused}
          searchResults={searchResults}
          onChangeIsFocused={onChangeIsFocused}
        />
      </div>
    </div>,
    document.body
  );
}

export default memo(SearchContentDrawer);
