"use client";

// utils
import { memo } from "react";

// components
import Link from "next/link";

function SearchResultContentCategoryNew({
  name,
  slug,
  collapse
}: {
  name: string;
  slug: string;
  collapse: () => void;
}) {
  return (
    <Link
      className="text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 px-3 py-1.5 rounded-full cursor-pointer transition-colors active:scale-95 whitespace-nowrap"
      href={`/${slug}`}
      onClick={collapse}
      prefetch
    >
      {name}
    </Link>
  );
}

export default memo(SearchResultContentCategoryNew);
