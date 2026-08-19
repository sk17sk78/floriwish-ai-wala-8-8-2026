// utils
import { memo } from "react";

// components
import SearchResultAITagNew from "./SearchResultAITagNew";
import SearchResultContentCategoryNew from "./SearchResultContentCategoryNew";

// types
import { SearchBarInitialContentsType } from "../../../../../Header";

import { useMemo } from "react";

function SearchResultContentCategoriesAITagsNew({
  categories,
  aiTags,
  collapse
}: {
  categories: SearchBarInitialContentsType["categories"];
  aiTags: SearchBarInitialContentsType["aiTags"];
  collapse: () => void;
}) {
  // Dynamically rotate categories so the 1st category changes on each search
  const items = useMemo(() => {
    if (!categories || categories.length <= 1) {
      return categories || [];
    }
    const offset = Math.floor(Math.random() * categories.length);
    return [
      ...categories.slice(offset),
      ...categories.slice(0, offset)
    ];
  }, [categories]);

  return items.length > 0 ? (
    <section className="flex flex-col gap-2 sm:py-1">
      <span className="font-semibold text-sm text-zinc-900">
        Categories
      </span>
      <section className="flex gap-2 overflow-x-auto scrollbar-hide min-h-[40px] max-w-[97dvw] lg:max-w-[440px]">
        {items.slice(0, 10).map(({ name, slug }, index) => (
          <SearchResultContentCategoryNew
            key={`${slug}-${index}`}
            name={name}
            slug={slug}
            collapse={collapse}
          />
        ))}
      </section>
    </section>
  ) : (
    <></>
  );
}

export default memo(SearchResultContentCategoriesAITagsNew);
