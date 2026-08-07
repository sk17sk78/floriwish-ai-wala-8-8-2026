// utils
import { lazy, memo } from "react";

// components
import { Dialog, DialogContent } from "@/components/ui/dialog";
const LazySearchContentUI = lazy(() => import("./SearchContentUI"));
import { Suspense } from "react";

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
    <Dialog
      open={isFocused}
      onOpenChange={onChangeIsFocused}
    >
      <DialogContent className="flex flex-col items-start justify-start outline-none border-none shadow-premium z-[996] max-w-[440px] h-[560px] bg-white rounded-t-3xl sm:rounded-3xl px-6 pt-10 sm:pt-10 pb-5 gap-y-4 transition-all duration-300 max-sm:hidden overflow-hidden">
        <Suspense fallback={<></>}>
          <LazySearchContentUI
            isFocused={isFocused}
            searchResults={searchResults}
            onChangeIsFocused={onChangeIsFocused}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

export default memo(SearchContentDrawer);
