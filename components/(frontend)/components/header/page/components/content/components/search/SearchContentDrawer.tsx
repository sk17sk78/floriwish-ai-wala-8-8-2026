"use client";

// utils
import { memo } from "react";

// components
import { Drawer, DrawerContent } from "@/components/ui/drawer";
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
  return (
    <Drawer
      open={isFocused}
      onOpenChange={onChangeIsFocused}
    >
      <DrawerContent className="outline-none border-none z-[996] max-h-[90dvh] h-[88dvh] bg-white rounded-t-[28px] px-4 pt-3 pb-6 flex flex-col transition-all duration-300 lg:hidden overflow-hidden shadow-2xl touch-manipulation">
        <div className="flex justify-center pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>
        <SearchContentUI
          isFocused={isFocused}
          searchResults={searchResults}
          onChangeIsFocused={onChangeIsFocused}
        />
      </DrawerContent>
    </Drawer>
  );
}

export default memo(SearchContentDrawer);
