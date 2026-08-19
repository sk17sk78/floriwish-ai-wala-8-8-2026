"use client";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { memo } from "react";

// components
import Link from "next/link";

function SearchResultAITagNew({
  name,
  aiTagId,
  collapse
}: {
  name: string;
  aiTagId: string;
  collapse: () => void;
}) {
  return (
    <Link
      href={`${FRONTEND_LINKS.SEARCH_PAGE}?ai=${aiTagId}`}
      prefetch
      onClick={collapse}
      className="text-xs font-semibold bg-white text-zinc-700 border border-zinc-200 hover:border-[#b76e79]/60 hover:bg-rose-50/40 px-3.5 py-2 rounded-full cursor-pointer transition-all duration-150 active:scale-95 whitespace-nowrap shadow-2xs"
    >
      {name}
    </Link>
  );
}

export default memo(SearchResultAITagNew);
