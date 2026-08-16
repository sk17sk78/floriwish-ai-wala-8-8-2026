/* eslint-disable @next/next/no-img-element */
"use client";

// icons
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Eye, MapPin, ThumbsUp, X } from "lucide-react";

// utils
import { memo, useMemo, useState } from "react";

// components
import ContentReviewRating from "./ContentReviewRating";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// types
import { type ContentReviewData } from "../types/ContentReviewData";

const AVATAR_PALETTES = [
  { bg: "bg-[#059669]", text: "text-white" }, // emerald
  { bg: "bg-[#d97706]", text: "text-white" }, // amber
  { bg: "bg-[#7c3aed]", text: "text-white" }, // violet
  { bg: "bg-[#0284c7]", text: "text-white" }, // sky
  { bg: "bg-[#be185d]", text: "text-white" }, // pink/rose
  { bg: "bg-[#4f46e5]", text: "text-white" }, // indigo
  { bg: "bg-[#0d9488]", text: "text-white" }, // teal
];

function ContentReview({
  review: { customerName, location, totalRating, review, photos = [], date = "Jun 2026" }
}: {
  review: ContentReviewData;
}) {
  const initial = (customerName || "V").trim()[0]?.toUpperCase() || "V";
  const [likes, setLikes] = useState(Math.floor(Math.random() * 8) + 2);
  const [hasLiked, setHasLiked] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const palette = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < customerName.length; i++) {
      hash = customerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
  }, [customerName]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const isModalOpen = activePhotoIndex !== null && photos.length > 0;
  const activePhoto = isModalOpen && activePhotoIndex !== null ? photos[activePhotoIndex] : null;

  return (
    <>
      <div className="w-[260px] min-[400px]:w-[275px] sm:w-[295px] md:w-[315px] lg:w-[325px] shrink-0 snap-start">
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-zinc-100 shadow-2xs flex flex-col justify-between h-full transition-all duration-300 hover:border-zinc-200 hover:shadow-xs">
          <div className="flex flex-col gap-2">
            {/* Header Row: Avatar + Name + Verified Badge + Date */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${palette.bg} ${palette.text} font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0 select-none`}
              >
                {initial}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                    {customerName}
                  </span>
                  <span
                    title="Verified Buyer"
                    className="inline-flex items-center text-[#0ea5e9] shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-[#0ea5e9] text-white" />
                  </span>
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-normal shrink-0">
                {date}
              </span>
            </div>

            {/* Rating & City Row (With Fractional/Half Star Display & Score) */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <ContentReviewRating rating={totalRating} size={12} showScore={true} scoreTextStyles="text-[11px] font-bold text-zinc-700 ml-1" />
              <span className="text-zinc-300">•</span>
              <div className="flex items-center gap-1 truncate text-zinc-500 text-[10.5px] sm:text-[11px]">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>

            {/* Review Comment Text */}
            <p className="text-[11.5px] sm:text-xs text-zinc-700 leading-relaxed font-normal mt-0.5 line-clamp-3">
              {review}
            </p>

            {/* Uploaded Customer Photos Thumbnail Strip */}
            {photos && photos.length > 0 && (
              <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-hide">
                {photos.map((photoUrl, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setActivePhotoIndex(pIdx)}
                    className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 group/photo cursor-pointer shrink-0"
                  >
                    <img
                      src={photoUrl}
                      alt="Buyer photo"
                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Helpful footer micro-interaction */}
          <div className="pt-2.5 mt-2 border-t border-zinc-100/80 flex items-center justify-between text-[10px] sm:text-[10.5px] text-zinc-400">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              ✓ Verified Purchase
            </span>
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
                hasLiked ? "text-violet-600 font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <ThumbsUp className={`w-2.5 h-2.5 ${hasLiked ? "fill-violet-600" : ""}`} />
              <span>Helpful ({likes})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Radix Portal Dialog Modal - Centered in Viewport */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) setActivePhotoIndex(null);
        }}
      >
        <DialogContent hideDefaultClose className="p-0 bg-transparent border-none shadow-none max-w-[92vw] sm:max-w-[440px] md:max-w-[480px] focus:outline-none outline-none">
          {activePhoto && (
            <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-zinc-100/90 w-full flex flex-col gap-3 relative animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header: Customer Info & Single Cut (❌) Button */}
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${palette.bg} ${palette.text} font-bold flex items-center justify-center text-xs shadow-xs`}
                  >
                    {initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900">
                        {customerName}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 fill-[#0ea5e9] text-white" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 block">
                      {location} • {date}
                    </span>
                  </div>
                </div>

                {/* Single Clear Cut / Close Button */}
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(null)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  aria-label="Close photo"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Photo Container */}
              <div className="relative w-full h-[240px] sm:h-[300px] md:h-[330px] rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center shadow-inner">
                <img
                  src={activePhoto}
                  alt="Customer photo"
                  className="w-full h-full object-contain"
                />

                {/* Prev Button */}
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex(
                        (activePhotoIndex! - 1 + photos.length) % photos.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                {/* Next Button */}
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex((activePhotoIndex! + 1) % photos.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Thumbnail Strip if multiple photos */}
              {photos.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-hide">
                  {photos.map((pUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activePhotoIndex
                          ? "border-[#ad2355] ring-2 ring-[#ad2355]/20 scale-105"
                          : "border-zinc-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={pUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Review Comment Snippet */}
              {review && (
                <p className="text-[11px] sm:text-xs text-zinc-600 bg-zinc-50 p-2 sm:p-2.5 rounded-xl border border-zinc-100 italic line-clamp-2">
                  &ldquo;{review}&rdquo;
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(ContentReview);
