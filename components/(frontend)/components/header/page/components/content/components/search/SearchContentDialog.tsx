"use client";

// utils
import { memo } from "react";

// components
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SearchContentUI from "./SearchContentUI";

// types
import { type SearchBarInitialContentsType } from "../../../../Header";

function SearchContentDialog({
  isFocused,
  searchResults,
  onChangeIsFocused
}: {
  isFocused: boolean;
  searchResults: SearchBarInitialContentsType | null;
  onChangeIsFocused: (isFocused: boolean) => void;
}) {
  return (
    <Dialog
      open={isFocused}
      onOpenChange={onChangeIsFocused}
    >
      <DialogContent className="flex flex-col items-start justify-start outline-none border-none shadow-2xl z-[996] max-w-[520px] w-full max-h-[85vh] h-[620px] bg-white rounded-3xl p-6 transition-all duration-300 max-sm:hidden overflow-hidden [&>button]:hidden">
        <SearchContentUI
          isFocused={isFocused}
          searchResults={searchResults}
          onChangeIsFocused={onChangeIsFocused}
        />
      </DialogContent>
    </Dialog>
  );
}

export default memo(SearchContentDialog);
