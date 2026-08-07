// icons
import { ArrowRight, Star, StarHalf, Zap } from "lucide-react";

// utils
import { normalizeRating } from "@/common/helpers/normalizeRating";
import { getRatingValue } from "../../utils/getRatingValue";

// components
import ContentHorizontalSpacing from "../../spacing/ContentHorizontalSpacing";

// types
import { type ContentRatingDocument } from "@/common/types/documentation/nestedDocuments/contentRating";

export default function ContentDetailRating({
  rating: { value, count },
  showSameDay,
  showViewSimilar,
  onClickViewSimilar,
}: {
  rating: ContentRatingDocument;
  showSameDay?: boolean;
  showViewSimilar?: boolean;
  onClickViewSimilar?: () => void;
}) {
  return (
    <ContentHorizontalSpacing>
      <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-charcoal-3">
        <div className="inline-flex items-center gap-0.5 rounded-md px-2.5 py-1 bg-[#fff6df] text-[11px] text-amber-500">
          <div className="flex items-center mr-1">
            {(() => {
              const ratingNum = Number(getRatingValue(value));
              const fullStars = Math.floor(ratingNum);
              const hasHalfStar = ratingNum % 1 >= 0.5;
              const stars = [];

              for (let i = 0; i < fullStars; i++) {
                stars.push(
                  <Star
                    key={`full-${i}`}
                    width={11}
                    height={11}
                    className="fill-amber-500 text-amber-500"
                  />
                );
              }

              if (hasHalfStar) {
                stars.push(
                  <StarHalf
                    key="half"
                    width={11}
                    height={11}
                    className="fill-amber-500 text-amber-500"
                  />
                );
              }

              return stars;
            })()}
          </div>
          <span className="text-amber-700 font-bold">{getRatingValue(value)}</span>
          {count ? (
            <span className="font-normal text-amber-600/80">({count})</span>
          ) : null}
        </div>
        {showSameDay ? (
          <div className="inline-flex items-center gap-1 rounded-md font-medium bg-[#fff5f8] px-2.5 py-0.5 text-moss">
            <Zap width={14} className="fill-current" />
            <span>Same Day</span>
          </div>
        ) : null}
        {showViewSimilar && onClickViewSimilar ? (
          <button
            type="button"
            onClick={onClickViewSimilar}
            className="inline-flex items-center gap-1 rounded-md border border-[#ebebeb] bg-[#f8f8f8] px-2.5 py-0.5 text-charcoal-3/65 transition-all duration-300 hover:border-[#ddd] hover:text-charcoal-3"
          >
            <span>More like this</span>
            <ArrowRight width={14} />
          </button>
        ) : null}
      </div>
    </ContentHorizontalSpacing>
  );
}
