"use client";

import { useState } from "react";
import WidthWrapper from "@/components/(frontend)/components/wrapper/WidthWrapper";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function QuickLinks({
  quickLinks
}: {
  quickLinks: Array<{
    _id: string;
    heading: string;
    content: Array<{ _id: string; label: string; url: string }>;
  }>;
}) {
  if (!quickLinks || !quickLinks.length) return null;

  return (
    <WidthWrapper className="my-3 sm:my-5 px-3.5 sm:px-5">
      <div className="flex flex-col justify-start space-y-4 sm:space-y-6 text-left w-full max-w-full">
        {quickLinks.map(({ heading, content }, index) => (
          <QuickLinkGroup key={index} heading={heading} content={content} />
        ))}
      </div>
    </WidthWrapper>
  );
}

function QuickLinkGroup({
  heading,
  content
}: {
  heading: string;
  content: Array<{ _id: string; label: string; url: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 2 items per line on Phone (4 items for 2 lines), 3 items per line on iPad/Laptop (6 items for 2 lines)
  const initialLimitPhone = 4; // 2 lines x 2 cols
  const initialLimitDesktop = 6; // 2 lines x 3 cols

  const visibleItems = isExpanded
    ? content
    : content.slice(0, initialLimitDesktop);

  const hiddenCount = content.length - initialLimitDesktop;

  return (
    <div className="py-1 text-left w-full max-w-full border-b border-stone-100 last:border-none pb-4">
      {heading && (
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight mb-2 text-left font-sans leading-snug">
          {heading}
        </h3>
      )}
      
      {/* Grid: 2 columns on Phone, 3 columns on iPad & Laptop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-full text-left">
        {visibleItems.map(({ _id, label, url }, idx) => (
          <Link
            key={_id || idx}
            href={url || "#"}
            className="px-2.5 py-1.5 bg-stone-50 hover:bg-rose-50 border border-stone-200/90 hover:border-rose-200 rounded-lg text-[11px] sm:text-xs text-gray-700 hover:text-rose-700 transition-all font-medium text-center truncate block leading-normal shadow-2xs"
            title={label}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Show More / Show Less Toggle Button */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#b76e79] hover:text-[#9a5963] hover:underline transition-colors cursor-pointer"
        >
          <span>{isExpanded ? "Show Less" : `Show More (+${hiddenCount} more)`}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}
