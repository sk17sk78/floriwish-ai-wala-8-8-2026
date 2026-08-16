"use client";

// icons
import { Star } from "lucide-react";

// utils
import { memo } from "react";

function ContentReviewRating({
  rating = 5,
  size = 14,
  showScore = false,
  scoreTextStyles = "text-xs font-bold text-zinc-700 ml-1"
}: {
  rating?: number;
  size?: number;
  showScore?: boolean;
  scoreTextStyles?: string;
}) {
  const numRating = Number(rating) || 5;

  return (
    <div className="inline-flex items-center gap-[2px]">
      <div className="flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((index) => {
          const fillPct = Math.min(100, Math.max(0, (numRating - index) * 100));

          if (fillPct >= 100) {
            return (
              <Star
                key={index}
                style={{ width: size, height: size }}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
            );
          }

          if (fillPct <= 0) {
            return (
              <Star
                key={index}
                style={{ width: size, height: size }}
                className="fill-zinc-200 text-zinc-200 shrink-0"
              />
            );
          }

          // Partial / Half Star
          return (
            <div
              key={index}
              className="relative shrink-0 flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              {/* Background Empty / Gray Star */}
              <Star
                style={{ width: size, height: size }}
                className="fill-zinc-200 text-zinc-200 absolute inset-0"
              />
              {/* Overlay Gold Filled Star with Width Clip */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillPct}%` }}
              >
                <Star
                  style={{ width: size, height: size }}
                  className="fill-amber-400 text-amber-400 max-w-none"
                />
              </div>
            </div>
          );
        })}
      </div>
      {showScore && (
        <span className={scoreTextStyles}>
          {numRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default memo(ContentReviewRating);
