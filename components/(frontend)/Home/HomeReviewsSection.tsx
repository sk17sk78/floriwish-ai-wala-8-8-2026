"use client";

// icons
import { ChevronLeft, ChevronRight } from "lucide-react";

// components
import ContentReview from "../content/review/components/ContentReview";

// hooks
import { useCallback, useId } from "react";
import { useWindowSize } from "usehooks-ts";

// types
import { ContentReviewData } from "../content/review/types/ContentReviewData";

const homeReviews: ContentReviewData[] = [
  {
    customerName: "Sanjeevan Shrivastava",
    totalRating: 4.0,
    review: "I ordered a flower bouquet for my mom, and it was even more beautiful than the picture. The fragrance and freshness made her so happy! 🌸",
    location: "Mumbai",
  },
  {
    customerName: "Bhavana Hasil",
    totalRating: 5.0,
    review: "The cake arrived exactly on time and tasted heavenly. So soft and creamy — everyone at home loved it!",
    location: "Jaipur",
  },
  {
    customerName: "Rubina Shastri",
    totalRating: 4.0,
    review: "I booked a birthday decoration, and honestly, it looked stunning. They made my living room feel like a party hall!",
    location: "Mumbai",
  },
  {
    customerName: "Prince Pandey",
    totalRating: 4.5,
    review: "Our varmala was fresh roses and smelled amazing. It truly made our wedding special and memorable.",
    location: "Varanasi",
  },
];

export default function HomeReviewsSection() {
  const id = useId();
  const { width } = useWindowSize();

  const handleReviewsScroll = useCallback(
    (dir: "left" | "right") => {
      const tray = document.getElementById(id) as HTMLElement;
      if (!tray) return;

      const currOffset = tray.scrollLeft;
      tray.scrollTo({
        left: currOffset + (dir === "left" ? -1 : 1) * (width * 0.65),
        behavior: "smooth"
      });
    },
    [id, width]
  );

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl sm:text-3xl font-medium text-charcoal-3">
          All Reviews
        </h2>
      </div>
      <div className="relative">
        <div
          id={id}
          className="flex items-stretch justify-start gap-3.5 sm:gap-6 overflow-x-scroll scrollbar-hide py-4 px-1"
        >
          {homeReviews.map((review, i) => (
            <ContentReview
              key={i}
              review={review}
            />
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-5 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-neutral-200 flex items-center justify-center text-charcoal-3 hover:bg-white transition-all z-10 backdrop-blur-sm active:scale-95"
          onClick={() => handleReviewsScroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-5 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-neutral-200 flex items-center justify-center text-charcoal-3 hover:bg-white transition-all z-10 backdrop-blur-sm active:scale-95"
          onClick={() => handleReviewsScroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
