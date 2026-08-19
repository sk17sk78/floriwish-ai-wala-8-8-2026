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
      className="text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 hover:border-[#b76e79]/60 hover:bg-rose-50/40 px-3.5 py-2 rounded-full cursor-pointer transition-all duration-150 active:scale-95 whitespace-nowrap shadow-2xs"
      href={`/${slug}`}
      onClick={collapse}
      prefetch
    >
      {name}
    </Link>
  );
}

export default memo(SearchResultContentCategoryNew);
