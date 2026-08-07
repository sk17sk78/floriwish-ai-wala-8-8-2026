// icons
import { Star, StarHalf } from "lucide-react";

// utils
import { memo } from "react";
import { normalizeRating } from "@/common/helpers/normalizeRating";
import { getRatingValue } from "@/components/(frontend)/content/utils/getRatingValue";

function CategoryTitle({
  title,
  rating,
  ratingCount,
  extraPadding,
  count
}: {
  title: string;
  rating: number;
  ratingCount: number;
  extraPadding?: boolean;
  count?: number;
}) {
  return (
    <div
      className={`flex flex-col items-start max-sm:pb-1 sm:items-center justify-center gap-y-1 sm:gap-y-1 px-4 sm:px-3 sm:pl-0 1200:pr-0 ${extraPadding ? "pt-4 sm:pt-5" : "pt-1 sm:pt-2"} `}
    >
      <h1
        className={`font-medium text-charcoal tracking-tight text-[23px] sm:text-[26px]`}
      >
        {title}
      </h1>
      <div className="flex items-center justify-start gap-1 sm:justify-end max-sm:py-2 sm:text-sm text-charcoal/60 font-medium">
        <div className="flex items-center gap-[1px]">
          {Array.from({ length: 5 }).map((_, i) => {
            const normalizedRatingValue = normalizeRating(rating) || 5;
            if (i + 1 <= Math.floor(normalizedRatingValue)) {
              return (
                <Star
                  key={i}
                  strokeWidth={1.5}
                  width={14}
                  height={14}
                  className="text-amber-500 fill-amber-500"
                />
              );
            } else if (i + 0.5 <= normalizedRatingValue) {
              return (
                <StarHalf
                  key={i}
                  strokeWidth={1.5}
                  width={14}
                  height={14}
                  className="text-amber-500 fill-amber-500"
                />
              );
            } else {
              return (
                <Star
                  key={i}
                  strokeWidth={1.5}
                  width={14}
                  height={14}
                  className="text-amber-500"
                />
              );
            }
          })}
        </div>
        <span>{getRatingValue(rating)}</span>
        <span>({ratingCount} reviews)</span>
      </div>
    </div>
  );
}

export default memo(CategoryTitle);
