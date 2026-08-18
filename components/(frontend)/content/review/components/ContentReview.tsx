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
  { bg: "bg-zinc-100", text: "text-zinc-700", border: "border-zinc-200" },
  { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
  { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200" },
  { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
];

function ContentReview({
  review: { customerName, location, totalRating, review, photos = [], date = "Jun 2026" }
}: {
  review: ContentReviewData;
}) {
  const initial = (customerName || "V").trim()[0]?.toUpperCase() || "V";
  const initialLikes = useMemo(() => {
    let hash = 0;
    const str = (customerName || "") + (location || "");
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 7) + 3;
  }, [customerName, location]);

  const [likes, setLikes] = useState(initialLikes);
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
      <div className="w-[260px] min-[400px]:w-[280px] sm:w-[300px] md:w-[320px] lg:w-[330px] shrink-0 snap-start">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/70 shadow-xs flex flex-col justify-between h-full transition-all duration-300 hover:border-zinc-300 hover:shadow-sm">
          <div className="flex flex-col gap-2.5">
            {/* Header Row: Avatar + Name + Verified Badge + Date */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full ${palette.bg} ${palette.text} ${palette.border} border font-semibold flex items-center justify-center text-xs sm:text-sm shrink-0 select-none`}
              >
                {initial}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                    {customerName}
                  </span>
                  <span
                    title="Verified Buyer"
                    className="inline-flex items-center text-emerald-600 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400 font-normal shrink-0">
                {date}
              </span>
            </div>

            {/* Rating & City Row */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <ContentReviewRating rating={totalRating} size={12} showScore={true} scoreTextStyles="text-xs font-semibold text-zinc-800 ml-1" />
              <span className="text-zinc-300">•</span>
              <div className="flex items-center gap-1 truncate text-zinc-500 text-[11px] sm:text-xs">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>

            {/* Review Comment Text */}
            <p className="text-xs sm:text-[13px] text-zinc-700 leading-relaxed font-normal mt-0.5 line-clamp-3">
              {review}
            </p>

            {/* Uploaded Customer Photos Thumbnail Strip */}
            {photos && photos.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-hide">
                {photos.map((photoUrl, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => setActivePhotoIndex(pIdx)}
                    className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group/photo cursor-pointer shrink-0 hover:border-zinc-400 transition-colors"
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

          {/* Footer: Verified & Helpful */}
          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
            <span className="text-zinc-500 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
            </span>
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                hasLiked ? "text-zinc-900 font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <ThumbsUp className={`w-3 h-3 ${hasLiked ? "fill-zinc-900 text-zinc-900" : ""}`} />
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
