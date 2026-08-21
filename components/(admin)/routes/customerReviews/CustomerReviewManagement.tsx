/* eslint-disable @next/next/no-img-element */
"use client";

// icons
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X
} from "lucide-react";

// utils
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

type ReviewItem = {
  _id: string;
  customerName: string;
  customerCity: string;
  content: {
    _id: string;
    name: string;
    slug: string;
    type?: string;
  } | string;
  contentName?: string;
  contentSlug?: string;
  contentType?: string;
  rating: number;
  review: string;
  photos?: string[];
  status: "pending" | "approved" | "rejected";
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export default function CustomerReviewManagement() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editRating, setEditRating] = useState<number>(5);
  const [editReview, setEditReview] = useState("");
  const [editStatus, setEditStatus] = useState<"pending" | "approved" | "rejected">("approved");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Lightbox Photo Preview
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Delete Confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch reviews
  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/customer-reviews?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  // Quick Action: Update Status (Approve / Reject)
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/customer-reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - (newStatus === "approved" || newStatus === "rejected" ? 1 : 0)),
          approved: newStatus === "approved" ? prev.approved + 1 : prev.approved,
          rejected: newStatus === "rejected" ? prev.rejected + 1 : prev.rejected
        }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rev: ReviewItem) => {
    setEditingReview(rev);
    setEditName(rev.customerName || "");
    setEditCity(rev.customerCity || "");
    setEditRating(rev.rating || 5);
    setEditReview(rev.review || "");
    setEditStatus(rev.status || "approved");
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/customer-reviews/${editingReview._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: editName,
          customerCity: editCity,
          rating: editRating,
          review: editReview,
          status: editStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === editingReview._id
              ? {
                  ...r,
                  customerName: editName,
                  customerCity: editCity,
                  rating: editRating,
                  review: editReview,
                  status: editStatus
                }
              : r
          )
        );
        setEditingReview(null);
      }
    } catch (err) {
      console.error("Failed to save edit", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/customer-reviews/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1)
        }));
        setDeletingId(null);
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Customer Reviews
            </h1>
            {stats.pending > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {stats.pending} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Review, approve, edit, or remove customer ratings and photo submissions before they appear on product pages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReviews()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Clean Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Card */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]"
              : "bg-white text-zinc-800 border-zinc-200/80 hover:border-amber-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Pending Moderation
            </span>
            <Clock className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1.5">
            {stats.pending}
          </div>
          <span className="text-[11px] opacity-80 block mt-1">
            Awaiting your approval
          </span>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setActiveTab("approved")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
              : "bg-white text-zinc-800 border-zinc-200/80 hover:border-emerald-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Approved (Live)
            </span>
            <CheckCircle2 className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1.5">
            {stats.approved}
          </div>
          <span className="text-[11px] opacity-80 block mt-1">
            Public on product pages
          </span>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setActiveTab("rejected")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "rejected"
              ? "bg-rose-600 text-white border-rose-600 shadow-md scale-[1.02]"
              : "bg-white text-zinc-800 border-zinc-200/80 hover:border-rose-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Rejected
            </span>
            <X className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1.5">
            {stats.rejected}
          </div>
          <span className="text-[11px] opacity-80 block mt-1">
            Hidden from website
          </span>
        </div>

        {/* Total Card */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-zinc-900 text-white border-zinc-900 shadow-md scale-[1.02]"
              : "bg-white text-zinc-800 border-zinc-200/80 hover:border-zinc-400 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              All Submissions
            </span>
            <MessageSquare className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1.5">
            {stats.total}
          </div>
          <span className="text-[11px] opacity-80 block mt-1">
            Total feedback received
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/60"
              }`}
            >
              {tab === "all" ? "All Reviews" : tab}
              {tab === "pending" && stats.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-zinc-950 font-black">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, city, or product..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-900 focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Reviews Stream */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#ad2355]" />
          <span className="text-sm font-medium">Fetching customer reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-base font-bold text-zinc-900">
              No {activeTab !== "all" ? activeTab : ""} reviews found
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {activeTab === "pending"
                ? "Awesome! There are no pending reviews waiting for moderation right now."
                : "When customer reviews match this filter, they will be listed here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const prodName =
              typeof rev.content === "object" && rev.content !== null
                ? rev.content.name
                : rev.contentName || "Product Review";
            const prodSlug =
              typeof rev.content === "object" && rev.content !== null
                ? rev.content.slug
                : rev.contentSlug || "";
            const prodType =
              typeof rev.content === "object" && rev.content !== null
                ? rev.content.type || "product"
                : rev.contentType || "product";

            const isPending = rev.status === "pending";
            const isApproved = rev.status === "approved";
            const isRejected = rev.status === "rejected";

            return (
              <div
                key={rev._id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs p-4 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-5 ${
                  isPending
                    ? "border-amber-300/80 bg-amber-50/15 ring-1 ring-amber-200/50"
                    : isApproved
                      ? "border-zinc-200/80 hover:border-zinc-300"
                      : "border-rose-200/80 bg-rose-50/10 opacity-75"
                }`}
              >
                {/* Left Section: Review Details */}
                <div className="flex-1 space-y-3.5">
                  {/* Customer Meta Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                        {rev.customerName ? rev.customerName[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 text-sm sm:text-base">
                            {rev.customerName || "Anonymous Customer"}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-[#0ea5e9] fill-[#0ea5e9] text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{rev.customerCity || "Verified Buyer"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Tag */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : isApproved
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {isPending && <Clock className="w-3 h-3" />}
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {isRejected && <X className="w-3 h-3" />}
                        <span>{rev.status}</span>
                      </span>

                      {rev.createdAt && (
                        <span className="text-xs text-zinc-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Product Pill */}
                  <div className="flex items-center gap-2 text-xs bg-zinc-50 rounded-xl px-3.5 py-2 border border-zinc-200/70 w-fit max-w-full">
                    <span className="text-zinc-500 font-semibold shrink-0">Product:</span>
                    <span className="font-bold text-zinc-800 truncate">{prodName}</span>
                    {prodSlug && (
                      <Link
                        href={`/${prodType}/${prodSlug}`}
                        target="_blank"
              rel="noopener noreferrer"
                        className="text-[#ad2355] font-semibold hover:underline inline-flex items-center gap-1 shrink-0 ml-1.5"
                      >
                        <span>View Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Rating Stars & Review Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < (rev.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-zinc-200 text-zinc-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-zinc-800 ml-1.5">
                        {rev.rating}.0 / 5.0
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-100 font-normal">
                      &ldquo;{rev.review}&rdquo;
                    </p>
                  </div>

                  {/* Customer Uploaded Photos Strip */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Customer Photos ({rev.photos.length})</span>
                        <span className="text-[11px] font-normal text-zinc-400 ml-1">
                          (Click to expand)
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                        {rev.photos.map((photoUrl, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => setPreviewPhoto(photoUrl)}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group/img cursor-pointer shrink-0 shadow-2xs"
                          >
                            <img
                              src={photoUrl}
                              alt="Customer upload"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Section: Moderation Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-100 pt-3 lg:pt-0 lg:pl-5 min-w-[140px]">
                  {/* Approve Button */}
                  {!isApproved && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(rev._id, "approved")}
                      disabled={actionLoadingId === rev._id}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      {actionLoadingId === rev._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {/* Reject Button */}
                  {!isRejected && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(rev._id, "rejected")}
                      disabled={actionLoadingId === rev._id}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rev)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Review</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingId(rev._id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-zinc-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setEditingReview(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-zinc-100 w-full max-w-lg overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-lg font-bold text-zinc-900">Edit Customer Review</h2>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Star Rating (1-5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditRating(s)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= editRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-zinc-100 text-zinc-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-zinc-700 ml-2">{editRating}.0</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Review Comment
                </label>
                <textarea
                  rows={4}
                  value={editReview}
                  onChange={(e) => setEditReview(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 outline-none"
                >
                  <option value="pending">🟡 Pending (Hidden from website)</option>
                  <option value="approved">🟢 Approved (Public & Live on Product)</option>
                  <option value="rejected">🔴 Rejected (Hidden from website)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-zinc-100 p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-zinc-900">Delete this Review?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                This action cannot be undone. The review will be permanently deleted from the database.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReview(deletingId)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Resolution Photo Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewPhoto}
            alt="Customer photo"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
