"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toSlug } from "@/common/utils/slugOperations";
import { popularSearchData } from "@/common/constants/popularSearches";
import WidthWrapper from "@/components/(frontend)/components/wrapper/WidthWrapper";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PopularSearchesSection() {
  const sections = [
    {
      title: "Cake Delivery Service",
      data: popularSearchData.cakeDeliveryCities,
    },
    {
      title: "Flower Delivery Service",
      data: popularSearchData.flowerDeliveryService,
    },
    {
      title: "Decoration Categories",
      data: popularSearchData.decorationCategories,
    },
    {
      title: "Decoration Services",
      data: popularSearchData.decorationServices,
    },
  ];

  return (
    <section className="py-3 sm:py-5 text-left w-full max-w-full overflow-x-hidden">
      <WidthWrapper className="px-3.5 sm:px-5">
        <div className="space-y-4 sm:space-y-6 text-left w-full max-w-full">
          {sections.map((section, sIdx) => (
            <PopularSearchGroup key={sIdx} title={section.title} data={section.data} />
          ))}
        </div>
      </WidthWrapper>
    </section>
  );
}

function PopularSearchGroup({
  title,
  data
}: {
  title: string;
  data: string[];
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 2 items per line on Phone (4 items for 2 lines), 3 items per line on iPad/Laptop (6 items for 2 lines)
  const initialLimitDesktop = 6; // 2 lines x 3 cols (Phone shows 2 cols x 2 lines = 4, desktop 3 cols x 2 lines = 6)

  const visibleItems = isExpanded
    ? data
    : data.slice(0, initialLimitDesktop);

  const hiddenCount = data.length - visibleItems.length;

  return (
    <div className="py-1 text-left w-full max-w-full border-b border-stone-100 last:border-none pb-4">
      <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 tracking-tight mb-2 text-left leading-snug">
        {title}
      </h2>

      {/* Grid: 2 columns on Phone, 3 columns on iPad & Laptop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-full text-left">
        {visibleItems.map((item, idx) => (
          <Link
            key={idx}
            href={`/search?key=${toSlug(item)}`}
            className="px-2.5 py-1.5 bg-stone-50 hover:bg-rose-50 border border-stone-200/90 hover:border-rose-200 rounded-lg text-[11px] sm:text-xs text-gray-700 hover:text-rose-700 transition-all font-medium text-center truncate block leading-normal shadow-2xs"
            title={item}
          >
            {item}
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
