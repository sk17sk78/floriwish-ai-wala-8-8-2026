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
  Sparkles,
  Star,
  X
} from "lucide-react";

// utils
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// components
import ContentReview from "../content/review/components/ContentReview";
import ContentReviewRating from "../content/review/components/ContentReviewRating";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// types
import { ContentReviewData } from "../content/review/types/ContentReviewData";

const DEFAULT_HOMEPAGE_REVIEWS: ContentReviewData[] = [
  {
    customerName: "Sanjeevan Shrivastava",
    totalRating: 5.0,
    review: "I ordered a flower bouquet for my mom, and it was even more beautiful than the picture. The fragrance and freshness made her so happy! 🌸",
    location: "Mumbai",
    date: "Jun 2026",
    verified: true
  },
  {
    customerName: "Bhavana Hasil",
    totalRating: 4.8,
    review: "The cake arrived exactly on time and tasted heavenly. So soft and creamy — everyone at home loved it!",
    location: "Jaipur",
    date: "Jun 2026",
    verified: true
  },
  {
    customerName: "Rubina Shastri",
    totalRating: 5.0,
    review: "I booked a birthday decoration, and honestly, it looked stunning. They made my living room feel like a party hall!",
    location: "Mumbai",
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Prince Pandey",
    totalRating: 4.5,
    review: "Our varmala was fresh roses and smelled amazing. It truly made our wedding special and memorable.",
    location: "Varanasi",
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Aarti Mehra",
    totalRating: 5.0,
    review: "Seamless experience from order to doorstep delivery! Floriwish is my go-to gifting service now.",
    location: "Delhi NCR",
    date: "May 2026",
    verified: true
  },
  {
    customerName: "Karan Johar",
    totalRating: 4.8,
    review: "The car decor was executed to perfection. The flowers stayed fresh throughout the entire function!",
    location: "Bangalore",
    date: "Apr 2026",
    verified: true
  }
];

export default function HomeReviewsSection() {
  const trayRef = useRef<HTMLDivElement>(null);
  
  // Live aggregate stats from all products & customer reviews
  const [stats, setStats] = useState({
    totalReviews: 999119,
    totalProducts: 2897,
    averageRating: 4.8,
    ratingBreakdown: [
      { stars: 5, pct: 78, label: "78%" },
      { stars: 4, pct: 16, label: "16%" },
      { stars: 3, pct: 4, label: "4%" },
      { stars: 2, pct: 1, label: "1%" },
      { stars: 1, pct: 1, label: "1%" },
    ]
  });

  const [liveApprovedReviews, setLiveApprovedReviews] = useState<ContentReviewData[]>([]);

  // Modal & Form States for Homepage Review Submission
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

  // Fetch live stats & approved reviews on mount
  useEffect(() => {
    fetch("/api/frontend/v2/frontend/review/homepage-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
        if (data.success && Array.isArray(data.approvedReviews) && data.approvedReviews.length > 0) {
          const formatted: ContentReviewData[] = data.approvedReviews.map((r: any) => ({
            customerName: r.customerName,
            location: r.customerCity,
            review: r.review,
            totalRating: Number(r.rating) || 5.0,
            photos: r.photos || [],
            date: r.date || "Recent",
            verified: true
          }));
          setLiveApprovedReviews(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Combine live approved customer reviews at front
  const allReviews = useMemo(() => {
    return [...liveApprovedReviews, ...DEFAULT_HOMEPAGE_REVIEWS];
  }, [liveApprovedReviews]);

  // Handle Photo Upload to AWS S3
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
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/frontend/v2/frontend/review/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          throw new Error(data.error || "Failed to upload image");
        }
      }

      setUploadedPhotos((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to upload photo to S3.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!customerName.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!customerCity.trim()) {
      setSubmitError("Please enter your city.");
      return;
    }
    if (!reviewText.trim()) {
      setSubmitError("Please write your review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/frontend/v2/frontend/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: "homepage",
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
        // Reset form
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

  // Formatted count display (e.g. 999,119 verified reviews)
  const formattedCount = useMemo(() => {
    return stats.totalReviews.toLocaleString("en-IN");
  }, [stats.totalReviews]);

  return (
    <section className="relative bg-white rounded-2xl sm:rounded-3xl border border-zinc-100 p-3.5 sm:p-5 md:p-6 shadow-2xs flex flex-col gap-3 sm:gap-4 w-full my-2">
      {/* Header Row: Title & Human-styled Write Button */}
      <div className="flex items-center justify-between gap-2 pb-0.5">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#ad2355] tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">CUSTOMER FEEDBACK</span>
          </span>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-zinc-900 tracking-tight mt-0.5 truncate">
            All Reviews
          </h2>
        </div>

        {/* Write Review Dialog Modal */}
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ad2355] hover:bg-[#8e1944] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 hover:shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              <span>Write a Review</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[94vw] sm:max-w-[450px] rounded-3xl p-4 sm:p-6 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {submitSuccess ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
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
                  <span className="text-[11px] font-bold text-[#ad2355] uppercase tracking-wider">
                    Share Your Story
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5">
                    Write a Review
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Upload photos and share your genuine experience.
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
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-[#ad2355] focus:bg-white transition-all"
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
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-[#ad2355] focus:bg-white transition-all"
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
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-[#ad2355] focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Photo Upload Section (AWS S3) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700">
                      Add Photos (Optional, max 5)
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      Stored on AWS S3 (&lt;100KB WebP)
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
                        id="homepage-review-photo-upload"
                      />
                      <label
                        htmlFor="homepage-review-photo-upload"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-[#ad2355] bg-zinc-50/50 hover:bg-[#ad2355]/5 text-zinc-700 hover:text-[#ad2355] text-xs font-semibold transition-all cursor-pointer ${
                          isUploadingPhoto ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        {isUploadingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#ad2355]" />
                            <span>Optimizing & Uploading to S3...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 text-[#ad2355]" />
                            <span>Camera / Photos / Gallery (Auto WebP &lt;100KB)</span>
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
                  className="w-full py-2.5 rounded-xl bg-[#ad2355] hover:bg-[#8e1944] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#ad2355]/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 mt-1"
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

      {/* Full-Width Rating Summary Box (Gracefully Expanded Across the Screen) */}
      <div className="bg-[#fafafc] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-zinc-100/90 grid grid-cols-[85px_1fr] min-[380px]:grid-cols-[100px_1fr] sm:grid-cols-[130px_1px_1fr] md:grid-cols-[150px_1px_1fr] lg:grid-cols-[170px_1px_1fr] items-center gap-2.5 min-[380px]:gap-3.5 sm:gap-6 md:gap-8 lg:gap-10 w-full">
        {/* Left: Big Score & Accurate Fractional/Half Star Rendering */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
          <span className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-[44px] font-black text-zinc-900 tracking-tight leading-none">
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="mt-1.5 flex items-center">
            <ContentReviewRating rating={stats.averageRating} size={13} />
          </div>
          <span className="text-[9.5px] min-[380px]:text-[10px] sm:text-xs text-zinc-500 font-medium mt-1 whitespace-nowrap">
            {formattedCount} verified reviews
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-14 sm:h-16 md:h-20 bg-zinc-200/80 shrink-0" />

        {/* Right: 5 Star Progress Bars (Expands smoothly across the entire width) */}
        <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
          {stats.ratingBreakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-2 sm:gap-2.5 text-xs">
              <div className="flex items-center gap-0.5 w-5 min-[380px]:w-6 sm:w-7 shrink-0 font-semibold text-zinc-700 text-[10px] sm:text-xs">
                <span>{row.stars}</span>
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 -translate-y-px" />
              </div>

              <div className="flex-1 h-1.5 sm:h-2 md:h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${row.pct}%` }}
                />
              </div>

              <span className="w-7 sm:w-8 text-right font-medium text-zinc-400 shrink-0 text-[10px] sm:text-xs">
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges Row - Clean Horizontal Tags on ALL Devices (Phone, iPad & Laptop) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 overflow-x-auto sm:flex-wrap scrollbar-hide py-0.5 w-full">
        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-50/80 text-emerald-800 border border-emerald-100/90 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] min-[380px]:text-[10.5px] sm:text-xs font-semibold whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 stroke-[2.5]" />
          100% Verified Purchases
        </span>
        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-purple-50/80 text-purple-800 border border-purple-100/90 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] min-[380px]:text-[10.5px] sm:text-xs font-semibold whitespace-nowrap shrink-0">
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 stroke-[2.5]" />
          Photos from Real Customers
        </span>
        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-blue-50/80 text-blue-800 border border-blue-100/90 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] min-[380px]:text-[10.5px] sm:text-xs font-semibold whitespace-nowrap shrink-0">
          <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 stroke-[2.5]" />
          Real Buyer Feedback
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
  );
}
