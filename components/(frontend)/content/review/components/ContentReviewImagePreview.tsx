"use client";

// icons
import { Camera, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

// utils
import { memo, useMemo } from "react";

// components
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NextImage from "@/components/custom/NextImage";

// types
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentReviewImagePreview({
  showPreview,
  images,
  activeIndex,
  onChangeShowPreview,
  onChangeActiveIndex
}: {
  showPreview: boolean;
  activeIndex: number;
  images: ImageDocument[];
  onChangeShowPreview: (showPreview: boolean) => void;
  onChangeActiveIndex: (activeIndex: number) => void;
}) {
  const activeImage = useMemo(() => {
    if (!images || images.length === 0) return null;
    return images[activeIndex] || images[0];
  }, [images, activeIndex]);

  if (!images || images.length === 0 || !activeImage) return null;

  return (
    <Dialog open={showPreview} onOpenChange={onChangeShowPreview}>
      <DialogContent hideDefaultClose className="p-0 bg-transparent border-none shadow-none max-w-[92vw] sm:max-w-[460px] md:max-w-[500px] focus:outline-none outline-none">
        <div className="bg-white rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-zinc-100/90 flex flex-col gap-3 relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header with Title, Counter & Distinct Cut (❌) Button */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ad2355]/10 text-[#ad2355] flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-zinc-900 leading-none">
                  Customer Photos
                </h3>
                <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium mt-0.5 block">
                  Photo {activeIndex + 1} of {images.length}
                </span>
              </div>
            </div>

            {/* Clear Close / Cut Button */}
            <button
              type="button"
              onClick={() => onChangeShowPreview(false)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="Close photo preview"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Main Photo Card */}
          <div className="relative w-full h-[250px] min-[400px]:h-[280px] sm:h-[320px] md:h-[350px] rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center group shadow-inner">
            <NextImage
              src={activeImage.url}
              alt={activeImage.alt || activeImage.defaultAlt || "Customer Review Photo"}
              className="w-full h-full object-contain"
              height={800}
              width={800}
              quality={85}
              priority
              draggable={false}
            />

            {/* Left Prev Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChangeActiveIndex(
                    (activeIndex - 1 + images.length) % images.length
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}

            {/* Right Next Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChangeActiveIndex((activeIndex + 1) % images.length)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-hide">
              {images.map(({ _id, alt, defaultAlt, url }, index) => {
                const isSelected = index === activeIndex;
                return (
                  <button
                    key={String(_id) + index}
                    type="button"
                    onClick={() => onChangeActiveIndex(index)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#ad2355] ring-2 ring-[#ad2355]/20 scale-105"
                        : "border-zinc-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <NextImage
                      src={url}
                      alt={alt || defaultAlt || "Thumbnail"}
                      className="w-full h-full object-cover"
                      height={80}
                      width={80}
                      quality={40}
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Verified Buyer Badge */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px] sm:text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              ✓ Verified Customer Photo
            </span>
            <span className="text-zinc-400">Floriwish Real Experience</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ContentReviewImagePreview);
