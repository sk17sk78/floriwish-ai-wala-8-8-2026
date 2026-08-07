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
      className="text-sm font-medium bg-ivory-2 text-charcoal-3/80 border border-charcoal-3/10 px-4 py-2 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white hover:border-charcoal-3/20 hover:shadow-premium"
    >
      {name}
    </Link>
  );
}

export default memo(SearchResultAITagNew);
