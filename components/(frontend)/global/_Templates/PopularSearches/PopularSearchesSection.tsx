import React from "react";
import Link from "next/link";
import { toSlug } from "@/common/utils/slugOperations";
import { popularSearchData } from "@/common/constants/popularSearches";

export default function PopularSearchesSection() {
  const sections = [
    {
      title: "Decoration Categories",
      data: popularSearchData.decorationCategories,
    },
    {
      title: "Decoration Services",
      data: popularSearchData.decorationServices,
    },
    {
      title: "Our Cake Delivery Cities",
      data: popularSearchData.cakeDeliveryCities,
    },
    {
      title: "Flower Delivery Service",
      data: popularSearchData.flowerDeliveryService,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Popular Searches
        </h2>
        {/* Modern accent line using your hover color */}
        <div className="h-1 w-16 bg-[#b76e79] rounded-full mt-4 mx-auto md:mx-0 opacity-80"></div>
      </div>

      <div className="space-y-8">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col md:flex-row gap-3 md:gap-6">
            <div className="md:w-64 font-medium text-gray-900 shrink-0 text-sm md:text-base">
              {section.title}
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {section.data.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/search?key=${toSlug(item)}`}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] md:text-xs text-gray-600 hover:bg-[#b76e79] hover:text-white hover:border-[#b76e79] transition-all duration-200 shadow-sm hover:shadow"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
