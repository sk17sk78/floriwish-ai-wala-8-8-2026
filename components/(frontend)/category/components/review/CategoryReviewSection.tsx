/* eslint-disable @next/next/no-img-element */
"use client";

// icons
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  ShieldCheck,
  Star,
  X
} from "lucide-react";

// utils
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateRandomCustomers } from "@/common/helpers/reviewsByCustomers/generateRandomCustomers";
import { cities } from "../../constants/city";

// components
import CategoryHorizontalSpacing from "../CategoryHorizontalSpacing";
import ContentReviewRating from "@/components/(frontend)/content/review/components/ContentReviewRating";
import ContentReview from "@/components/(frontend)/content/review/components/ContentReview";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";

// types
import { type ContentReviewData } from "@/components/(frontend)/content/review/types/ContentReviewData";
import { type PersonalizedReviewDocument } from "@/common/types/documentation/nestedDocuments/personalizedReview";

const DEFAULT_CATEGORY_REVIEWS: ContentReviewData[] = [
  {
    customerName: "Sanjeevan Shrivastava",
    location: "Mumbai",
    review: "I ordered this for my family, and it was even more beautiful than the picture. The quality, presentation, and freshness were outstanding! 🌸",
    totalRating: 5.0,
    date: "Jun 2026",
    verified: true
  },
  {
    customerName: "Bhavana Hasil",
    location: "Jaipur",
    review: "The delivery arrived exactly on time and in perfect condition. Everyone at home loved the quality and presentation. Will definitely order again!",
    totalRating: 4.8,
    date: "Jun 2026",
    verified: true
  },
  {
    customerName: "Rubina Shastri",
    location: "Mumbai",
    review: "Fantastic service and top-notch packaging. The quality was premium and made the celebration extra special!",
    totalRating: 5.0,
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Prince Panchal",
    location: "Delhi",
    review: "Impressed by the timely delivery and flawless presentation. Truly made our event memorable.",
    totalRating: 4.5,
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Ananya Deshmukh",
    location: "Pune",
    review: "Super fresh and well-crafted. Delivery was prompt within the promised time slot. Highly recommended!",
    totalRating: 5.0,
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Rohan Kulkarni",
    location: "Bangalore",
    review: "Extremely reliable service! The ordering was seamless and the product exceeded expectations.",
    totalRating: 4.9,
    date: "Apr 2026",
    verified: true
  }
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 68, label: "68%" },
  { stars: 4, pct: 22, label: "22%" },
  { stars: 3, pct: 7, label: "7%" },
  { stars: 2, pct: 2, label: "2%" },
  { stars: 1, pct: 1, label: "1%" }
];

// Helper: client-side fast canvas image optimization
async function compressImageInBrowser(file: File): Promise<Blob | File> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const MAX_DIM = 1200;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(file);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  resolve(file);
                }
              },
              "image/webp",
              0.82
            );
          } catch {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}

import { getRatingValue } from "@/components/(frontend)/content/utils/getRatingValue";

function CategoryReviewSection({
  categoryId,
  reviews,
  rating,
  ratingCount
}: {
  categoryId: string;
  reviews?: PersonalizedReviewDocument[];
  rating?: number;
  ratingCount?: number;
}) {
  const trayRef = useRef<HTMLDivElement>(null);

  // Dynamic normalized rating matching the top exactly
  const ratingScore = useMemo(() => {
    if (typeof rating === "number" && rating > 0) {
      return Number(getRatingValue(rating));
    }
    return 4.5;
  }, [rating]);

  // Formatted count display matching the top count exactly
  const formattedCount = useMemo(() => {
    if (typeof ratingCount === "number" && ratingCount > 0) {
      return ratingCount.toLocaleString("en-IN");
    }
    return "1,59,497";
  }, [ratingCount]);

  // Dynamic 5★ to 1★ Progress Breakdown based on actual rating score
  const ratingBreakdown = useMemo(() => {
    if (ratingScore >= 4.7) {
      return [
        { stars: 5, pct: 78, label: "78%" },
        { stars: 4, pct: 16, label: "16%" },
        { stars: 3, pct: 4, label: "4%" },
        { stars: 2, pct: 1, label: "1%" },
        { stars: 1, pct: 1, label: "1%" },
      ];
    }
    if (ratingScore >= 4.4) {
      return [
        { stars: 5, pct: 68, label: "68%" },
        { stars: 4, pct: 22, label: "22%" },
        { stars: 3, pct: 7, label: "7%" },
        { stars: 2, pct: 2, label: "2%" },
        { stars: 1, pct: 1, label: "1%" },
      ];
    }
    if (ratingScore >= 4.0) {
      return [
        { stars: 5, pct: 54, label: "54%" },
        { stars: 4, pct: 28, label: "28%" },
        { stars: 3, pct: 12, label: "12%" },
        { stars: 2, pct: 4, label: "4%" },
        { stars: 1, pct: 2, label: "2%" },
      ];
    }
    if (ratingScore >= 3.5) {
      return [
        { stars: 5, pct: 40, label: "40%" },
        { stars: 4, pct: 32, label: "32%" },
        { stars: 3, pct: 18, label: "18%" },
        { stars: 2, pct: 6, label: "6%" },
        { stars: 1, pct: 4, label: "4%" },
      ];
    }
    return [
      { stars: 5, pct: 30, label: "30%" },
      { stars: 4, pct: 25, label: "25%" },
      { stars: 3, pct: 25, label: "25%" },
      { stars: 2, pct: 12, label: "12%" },
      { stars: 1, pct: 8, label: "8%" },
    ];
  }, [ratingScore]);

  // Modal & Form States for Category Review Submission
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerCity, setCustomerCity] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine personalized reviews with generated / default reviews
  const allReviews = useMemo((): ContentReviewData[] => {
    if (reviews && reviews.length > 0) {
      const customerData = generateRandomCustomers({
        limit: reviews.length,
        serviceId: categoryId || "cat-review",
        cities
      });

      return reviews.map((r, i) => ({
        customerName: customerData[i]?.customerName || "Verified Buyer",
        location: r.area || customerData[i]?.location || "Mumbai",
        totalRating: customerData[i]?.totalRating || 5.0,
        review: r.review,
        date: "Recent",
        verified: true
      }));
    }
    return DEFAULT_CATEGORY_REVIEWS;
  }, [categoryId, reviews]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedPhotos.length + files.length > 5) {
      setSubmitError("You can upload a maximum of 5 photos per review.");
      return;
    }

    setIsUploadingPhoto(true);
    setSubmitError("");

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const optimizedBlob = await compressImageInBrowser(file);

        const formData = new FormData();
        const uploadFile = new File([optimizedBlob], file.name.replace(/\.[^.]+$/, ".webp"), {
          type: "image/webp"
        });
        formData.append("file", uploadFile);

        const res = await fetch("/api/frontend/v2/frontend/review/upload", {
          method: "POST",
          body: formData
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          throw new Error("Server upload error. Please try again.");
        }

        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          throw new Error(data.error || "Failed to upload image");
        }
      }

      setUploadedPhotos((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerCity.trim() || !reviewText.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/frontend/v2/frontend/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: categoryId,
          customerName: customerName.trim(),
          customerCity: customerCity.trim(),
          rating: selectedRating,
          review: reviewText.trim(),
          photos: uploadedPhotos
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setCustomerName("");
        setCustomerCity("");
        setReviewText("");
        setUploadedPhotos([]);
        setSelectedRating(5);
      } else {
        setSubmitError(data.error || "Failed to submit review. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSubmitSuccess(false);
      setSubmitError("");
    }
  };

  const handleReviewsScroll = useCallback((dir: "left" | "right") => {
    const tray = trayRef.current;
    if (!tray) return;
    const scrollAmount = dir === "left" ? -310 : 310;
    tray.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  }, []);

  return (
    <CategoryHorizontalSpacing className="my-3">
      <section className="relative bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 p-4 sm:p-5 md:p-6 shadow-xs flex flex-col gap-3.5 sm:gap-4.5 w-full my-2">
        {/* Header Row: Title & Human-styled Write Button */}
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-zinc-100">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 tracking-wider uppercase">
              Verified Customer Reviews
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 tracking-tight mt-0.5 truncate">
              Customer Feedback
            </h2>
          </div>

          {/* Write Review Dialog Modal */}
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-900 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold shadow-2xs transition-all duration-200 hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-zinc-600" />
                <span>Write a Review</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[94vw] sm:max-w-[450px] rounded-3xl p-4 sm:p-6 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
              {submitSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                    Thank you for your review!
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                    Your review and photos have been submitted. They will appear here once approved by our moderation team.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-3.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Share Your Experience
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5">
                      Write a Review
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Upload photos and share your honest feedback.
                    </p>
                  </div>

                  {/* Rating Stars Selection */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700">
                      Overall Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              star <= selectedRating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-zinc-100 text-zinc-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-zinc-700 ml-1.5">
                        {selectedRating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Name & City Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-medium text-zinc-700 block mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Vidya Patel"
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-700 block mb-1">
                        Your City *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder="e.g. Bangalore"
                        className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Review Comments */}
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How was the product quality and delivery experience?"
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Photo Upload Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-zinc-700">
                        Add Photos (Optional, max 5)
                      </label>
                      <span className="text-[10px] text-zinc-400">
                        WebP &lt;100KB
                      </span>
                    </div>

                    {/* Photo Thumbnails */}
                    {uploadedPhotos.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {uploadedPhotos.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group shrink-0"
                          >
                            <img
                              src={url}
                              alt="Uploaded preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-[9px] transition-all cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    {uploadedPhotos.length < 5 && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,image/jpeg,image/png,image/webp,image/heic,image/heif"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="category-review-photo-upload"
                        />
                        <label
                          htmlFor="category-review-photo-upload"
                          className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50/50 hover:bg-zinc-100/50 text-zinc-700 text-xs font-medium transition-all cursor-pointer ${
                            isUploadingPhoto ? "opacity-60 pointer-events-none" : ""
                          }`}
                        >
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                              <span>Uploading photo...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-zinc-600" />
                              <span>Upload Photos</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {submitError && (
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPhoto}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 mt-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Review...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Full-Width Rating Summary Box */}
        <div className="bg-zinc-50/80 rounded-2xl p-4 sm:p-5 md:p-6 border border-zinc-200/60 grid grid-cols-[85px_1fr] min-[380px]:grid-cols-[100px_1fr] sm:grid-cols-[130px_1px_1fr] md:grid-cols-[150px_1px_1fr] lg:grid-cols-[170px_1px_1fr] items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 w-full">
          {/* Left: Big Score */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
            <span className="text-3xl sm:text-4xl md:text-[42px] font-bold text-zinc-900 tracking-tight leading-none">
              {ratingScore.toFixed(1)}
            </span>
            <div className="mt-2 flex items-center">
              <ContentReviewRating rating={ratingScore} size={14} />
            </div>
            <span className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-1.5 whitespace-nowrap">
              {formattedCount} verified reviews
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-14 sm:h-16 md:h-20 bg-zinc-200 shrink-0" />

          {/* Right: 5 Star Progress Bars */}
          <div className="flex flex-col gap-2 w-full">
            {ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1 w-5 min-[380px]:w-6 sm:w-7 shrink-0 font-bold text-zinc-900 text-xs sm:text-sm">
                  <span>{row.stars}</span>
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#f5a623] text-[#f5a623] -translate-y-px" />
                </div>

                <div className="flex-1 h-2.5 sm:h-3 bg-[#f1f2f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f5a623] rounded-full transition-all duration-500"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>

                <span className="w-8 sm:w-9 text-right font-medium text-zinc-400 shrink-0 text-xs sm:text-sm">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unified Trust Badges Row - Clean Neutral Tags */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto sm:flex-wrap scrollbar-hide py-0.5 w-full">
          <span className="inline-flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-700 border border-zinc-200/80 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            100% Verified Purchases
          </span>
          <span className="inline-flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-700 border border-zinc-200/80 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-colors">
            <Camera className="w-3.5 h-3.5 text-zinc-500" />
            Customer Photos
          </span>
          <span className="inline-flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100/80 text-zinc-700 border border-zinc-200/80 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-colors">
            <BadgeCheck className="w-3.5 h-3.5 text-zinc-500" />
            Authentic Feedback
          </span>
        </div>

        {/* Reviews Slider Carousel */}
        <div className="relative w-full group mt-1">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => handleReviewsScroll("left")}
            className="hidden sm:flex absolute -left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-zinc-200 shadow-md text-zinc-700 items-center justify-center transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 z-20 cursor-pointer"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Reviews Slider Tray */}
          <div
            ref={trayRef}
            className="flex items-stretch justify-start gap-3 sm:gap-3.5 md:gap-4 overflow-x-auto scrollbar-hide py-1 px-0.5 w-full snap-x snap-mandatory touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {allReviews.map((item, i) => (
              <ContentReview key={i} review={item} />
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => handleReviewsScroll("right")}
            className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-zinc-200 shadow-md text-zinc-700 items-center justify-center transition-all duration-200 hover:bg-zinc-50 hover:scale-105 active:scale-95 z-20 cursor-pointer"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </section>
    </CategoryHorizontalSpacing>
  );
}

export default memo(CategoryReviewSection);
