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
      className="text-sm font-medium bg-ivory-2 text-charcoal-3/80 border border-charcoal-3/10 px-4 py-2 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white hover:border-charcoal-3/20 hover:shadow-premium whitespace-nowrap"
      href={`/${slug}`}
      onClick={collapse}
      prefetch
    >
      {name}
    </Link>
  );
}

export default memo(SearchResultContentCategoryNew);
