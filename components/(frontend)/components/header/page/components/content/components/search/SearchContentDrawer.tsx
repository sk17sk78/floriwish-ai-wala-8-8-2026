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
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => onChangeIsFocused(false)}
      />

      {/* Sheet Container: Height 75dvh to match 7eventzz screenshot */}
      <div className="relative w-full max-w-full min-w-0 h-[75dvh] max-h-[85dvh] bg-white rounded-t-[28px] flex flex-col overflow-hidden shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
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
