"use client";

import MaxWidthWrapper from "@/components/(frontend)/global/_MaxWidthWrapper/MaxWidthWrapper";
import BoxTheme from "@/components/(frontend)/global/_Templates/BoxTheme/BoxTheme";

export default function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 sm:gap-y-6 sm:gap-x-3 items-start justify-center">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 p-2 sm:p-0">
          {/* Image Skeleton */}
          <div className="relative aspect-square w-full bg-gray-200 animate-pulse rounded-xl overflow-hidden" />
          
          {/* Content Skeleton */}
          <div className="flex flex-col gap-2 px-1 sm:px-3">
             {/* Badge Skeleton */}
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            
            {/* Title Skeleton */}
            <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
            
            {/* Price Skeleton */}
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
            
            {/* Rating Skeleton */}
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
