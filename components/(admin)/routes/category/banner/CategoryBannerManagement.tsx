"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  Smartphone,
  Monitor,
  Eye,
  Trash2,
  Edit3,
  Power,
  Zap,
  Check,
  X,
  ExternalLink,
  History,
  Filter,
  Sparkles,
  Folder,
  Image as ImageIcon,
  FolderOpen
} from "lucide-react";

// Redux & Media Library
import { useDispatch, useSelector } from "@/store/withType";
import { createImageAction, selectImage } from "@/store/features/media/imageSlice";
import { createFolderAction, selectFolder } from "@/store/features/media/folderSlice";
import ImageManagement from "@/components/(admin)/routes/media/imageManagement/ImageManagement";

interface CategoryItem {
  id: string;
  name: string;
  rawName?: string;
  slug: string;
  fullPath?: string;
  level?: number;
  type: string;
  typeLabel: string;
}

interface BannerCampaign {
  _id: string;
  title: string;
  name: string;
  altText: string;
  linkUrl?: string;
  openInNewTab: boolean;
  startDate?: string | null;
  endDate?: string | null;
  desktopImage: { url: string; alt?: string; width?: number; height?: number };
  mobileImage: { url: string; alt?: string; width?: number; height?: number };
  appliedCategories: Array<{ categoryId: string; categoryType: string; slug: string; name: string }>;
  allCategories: boolean;
  autoApplyFuture: boolean;
  isActive: boolean;
  targetDevice?: "all" | "desktop" | "mobile";
  priority: number;
  bannerType: string;
  autoScroll: boolean;
  scrollInterval: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  _id: string;
  action: string;
  bannerTitle: string;
  performedBy: string;
  affectedCategoriesCount: number;
  notes?: string;
  createdAt: string;
}

interface BackgroundJob {
  _id: string;
  bannerTitle: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  totalCategories: number;
  processedCategories: number;
  currentBatch: number;
  totalBatches: number;
  failedCategories: string[];
  initiatedBy: string;
  startedAt?: string;
  completedAt?: string;
  logs: Array<{ timestamp: string; message: string; level: string }>;
}

export default function CategoryBannerManagement() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"create" | "campaigns" | "queue" | "audit">("create");

  // Redux Media Library bindings
  const dispatch = useDispatch();
  const contentImageStatus = useSelector((state: any) => state?.images?.status || "idle");
  const contentImageDocuments = useSelector((state: any) => state?.images?.documentList || []);
  const folderStatus = useSelector((state: any) => state?.folders?.status || "idle");

  useEffect(() => {
    if (contentImageStatus === "idle") {
      dispatch(createImageAction.fetchDocumentList());
    }
  }, [contentImageStatus, dispatch]);

  useEffect(() => {
    if (folderStatus === "idle") {
      dispatch(createFolderAction.fetchDocumentList());
    }
  }, [folderStatus, dispatch]);

  // Media Library Popup State
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"desktop" | "mobile">("desktop");

  // Main data states
  const [banners, setBanners] = useState<BannerCampaign[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    categoriesUsingBanner: 0,
    activeBannerCount: 0,
    inactiveBannerCount: 0,
    totalBanners: 0,
    lastUpdated: null as string | null,
    lastUpdatedBy: "Admin"
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formName, setFormName] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formPriority, setFormPriority] = useState<number>(10);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formTargetDevice, setFormTargetDevice] = useState<"all" | "desktop" | "mobile">("all");
  const [formAllCategories, setFormAllCategories] = useState<boolean>(false);
  const [formAutoApplyFuture, setFormAutoApplyFuture] = useState<boolean>(true);

  // Images state (matching Homepage 3:1 desktop and 2:1 mobile)
  const [desktopImage, setDesktopImage] = useState<{ url: string; alt?: string; width?: number; height?: number } | null>(null);
  const [mobileImage, setMobileImage] = useState<{ url: string; alt?: string; width?: number; height?: number } | null>(null);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  // Category Search, Level Filter and Selection
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [allCategoriesMaster, setAllCategoriesMaster] = useState<CategoryItem[]>([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryLevel, setSelectedCategoryLevel] = useState<string>("all");

  // Strict in-memory search + Level Filter (Category 1, 2, 3, 4, 5, Mobile, Addon)
  const filteredAvailableCategories = useMemo(() => {
    let list = Array.isArray(allCategoriesMaster) ? allCategoriesMaster : [];

    // 1. Strict Tab Level Filter (Category 1, 2, 3, 4, 5, Mobile, Addon)
    if (selectedCategoryLevel !== "all") {
      list = list.filter((c) => c && c.type === selectedCategoryLevel);
    }

    // 2. Strict Name & Slug Search Filter (matches name or slug only, never typeLabel)
    if (categorySearchQuery && categorySearchQuery.trim()) {
      const terms = categorySearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter((c) => {
        if (!c) return false;
        const nameText = (c.name || "").toLowerCase();
        const slugText = (c.slug || "").toLowerCase();
        return terms.every((t) => nameText.includes(t) || slugText.includes(t));
      });
    }

    return list;
  }, [allCategoriesMaster, selectedCategoryLevel, categorySearchQuery]);

  // Redis Cache Refresh State
  const [isRefreshingRedis, setIsRefreshingRedis] = useState(false);

  // Background Job Processing
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobData, setActiveJobData] = useState<BackgroundJob | null>(null);

  // Preview mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Notification Toast
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3800);
  }, []);

  // Fetch initial dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/category-banners");
      const data = await res.json();
      if (data.success) {
        setBanners(data.data.banners || []);
        setStats(data.data.stats || {});
        setAuditLogs(data.data.recentLogs || []);
        setJobs(data.data.recentJobs || []);
      }
    } catch (err: any) {
      showToast("Unable to load banner data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch all categories master catalog across all levels (1, 2, 3, 4, 5, Mobile, Addons)
  const fetchAllCategories = useCallback(async () => {
    try {
      setIsSearchingCategories(true);
      const res = await fetch(`/api/admin/category-banners/categories/search?q=&limit=10000`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setAllCategoriesMaster(data.categories);
      }
    } catch (err) {
      console.error("Failed to load category catalog", err);
    } finally {
      setIsSearchingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAllCategories();
  }, [fetchDashboardData, fetchAllCategories]);

  // Open Media Library Picker
  const handleOpenMediaPicker = (target: "desktop" | "mobile") => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  // Handle Image Selected from Media Library Modal
  const handleMediaImageSelected = async (selectedId: string | string[]) => {
    const id = Array.isArray(selectedId) ? selectedId[0] : selectedId;
    if (!id) return;

    let targetUrl = "";
    let targetAlt = "";
    let targetWidth = mediaPickerTarget === "desktop" ? 1200 : 480;
    let targetHeight = mediaPickerTarget === "desktop" ? 400 : 240;

    // Check cached redux documents
    const cachedDoc = (contentImageDocuments || []).find((doc: any) => String(doc._id) === String(id));
    if (cachedDoc && cachedDoc.url) {
      targetUrl = cachedDoc.url;
      targetAlt = cachedDoc.alt || cachedDoc.defaultAlt || formTitle;
      if (cachedDoc.width) targetWidth = cachedDoc.width;
      if (cachedDoc.height) targetHeight = cachedDoc.height;
    } else {
      try {
        const res = await fetch(`/api/admin/media/image/${id}`);
        const data = await res.json();
        if (data && data.document) {
          targetUrl = data.document.url || `/media/images/${data.document.name}.${data.document.extension}`;
          targetAlt = data.document.alt || data.document.defaultAlt || formTitle;
          if (data.document.width) targetWidth = data.document.width;
          if (data.document.height) targetHeight = data.document.height;
        }
      } catch (err) {
        console.error("Error fetching media image doc", err);
      }
    }

    if (targetUrl) {
      if (mediaPickerTarget === "desktop") {
        setDesktopImage({
          url: targetUrl,
          alt: targetAlt,
          width: targetWidth,
          height: targetHeight
        });
        showToast("Laptop banner selected from Media Library");
      } else {
        setMobileImage({
          url: targetUrl,
          alt: targetAlt,
          width: targetWidth,
          height: targetHeight
        });
        showToast("Mobile banner selected from Media Library");
      }
    }
    setShowMediaPicker(false);
  };

  // Direct File Upload Handlers (Supports Drag & Drop)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    type: "desktop" | "mobile"
  ) => {
    let file: File | null = null;
    if ("target" in e && (e.target as HTMLInputElement)?.files) {
      file = (e.target as HTMLInputElement).files?.[0] || null;
    } else if ("dataTransfer" in e && (e as React.DragEvent<HTMLElement>).dataTransfer?.files) {
      file = (e as React.DragEvent<HTMLElement>).dataTransfer.files[0] || null;
    }

    if (!file) return;

    const setterLoading = type === "desktop" ? setIsUploadingDesktop : setIsUploadingMobile;
    const setterImage = type === "desktop" ? setDesktopImage : setMobileImage;

    try {
      setterLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/admin/category-banners/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setterImage(data.data);
        showToast(`${type === "desktop" ? "Laptop Banner" : "Mobile Banner"} uploaded successfully`);
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Upload error", "error");
    } finally {
      setterLoading(false);
    }
  };

  // Category Toggle Selection (ID-safe across levels and parent categories)
  const toggleCategorySelection = (cat: CategoryItem) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => (c.id && cat.id ? c.id === cat.id : c.slug === cat.slug && c.type === cat.type));
      if (exists) {
        return prev.filter((c) => (c.id && cat.id ? c.id !== cat.id : !(c.slug === cat.slug && c.type === cat.type)));
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleSelectAllCategories = (checked: boolean) => {
    setFormAllCategories(checked);
    if (checked) {
      setSelectedCategories([]);
    }
  };

  // Level-specific Select All / Deselect All
  const handleToggleSelectAllForLevel = () => {
    const targetCats = Array.isArray(filteredAvailableCategories) ? filteredAvailableCategories : [];
    if (targetCats.length === 0) return;

    const allLevelSelected = targetCats.every((c) =>
      (selectedCategories || []).some((s) => (s.id && c.id ? s.id === c.id : s.slug === c.slug && s.type === c.type))
    );

    if (allLevelSelected) {
      const targetIds = new Set(targetCats.map((c) => c.id || `${c.type}_${c.slug}`));
      setSelectedCategories((prev) =>
        (prev || []).filter((c) => !targetIds.has(c.id || `${c.type}_${c.slug}`))
      );
    } else {
      setSelectedCategories((prev) => {
        const existingIds = new Set((prev || []).map((c) => c.id || `${c.type}_${c.slug}`));
        const newToAdd = targetCats.filter((c) => !existingIds.has(c.id || `${c.type}_${c.slug}`));
        return [...(prev || []), ...newToAdd];
      });
    }
  };

  const isCurrentLevelAllSelected = useMemo(() => {
    const targetCats = Array.isArray(filteredAvailableCategories) ? filteredAvailableCategories : [];
    if (targetCats.length === 0) return false;
    return targetCats.every((c) =>
      (selectedCategories || []).some((s) => (s.id && c.id ? s.id === c.id : s.slug === c.slug && s.type === c.type))
    );
  }, [filteredAvailableCategories, selectedCategories]);

  const levelSelectAllLabel = useMemo(() => {
    const levelLabels: Record<string, string> = {
      all: "All Visible Categories",
      category1: "Category 1",
      category2: "Category 2 (Topics)",
      category3: "Category 3 (SubTopics)",
      category4: "Category 4",
      category5: "Category 5",
      catalogue: "Mobile Categories",
      addon: "Addon Categories"
    };

    const targetCats = Array.isArray(filteredAvailableCategories) ? filteredAvailableCategories : [];
    const name = levelLabels[selectedCategoryLevel] || "Current View";
    return isCurrentLevelAllSelected
      ? `Deselect All ${name} (${targetCats.length})`
      : `Select All ${name} (${targetCats.length})`;
  }, [selectedCategoryLevel, filteredAvailableCategories, isCurrentLevelAllSelected]);

  const handleClearSelectedCategories = () => {
    setSelectedCategories([]);
    setFormAllCategories(false);
  };

  // Save / Update Banner Campaign
  const handleSaveBanner = async () => {
    if (!formTitle.trim() || !formName.trim()) {
      showToast("Please provide a Banner Title and Internal Name.", "error");
      return;
    }

    const finalDesktop = desktopImage?.url ? desktopImage : mobileImage;
    const finalMobile = mobileImage?.url ? mobileImage : desktopImage;

    if (!finalDesktop?.url && !finalMobile?.url) {
      showToast("Please select or upload at least one banner image (Laptop or Mobile).", "error");
      return;
    }

    if (!formAllCategories && selectedCategories.length === 0) {
      showToast("Please select at least one category or enable 'Select All Categories'.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        title: formTitle,
        name: formName,
        altText: formAltText || formTitle,
        linkUrl: formLinkUrl,
        openInNewTab: formOpenInNewTab,
        startDate: formStartDate || null,
        endDate: formEndDate || null,
        priority: formPriority,
        isActive: formIsActive,
        targetDevice: formTargetDevice,
        allCategories: formAllCategories,
        autoApplyFuture: formAutoApplyFuture,
        desktopImage: finalDesktop,
        mobileImage: finalMobile,
        appliedCategories: selectedCategories.map((c) => ({
          categoryId: c.id,
          categoryType: c.type,
          slug: c.slug,
          name: c.name
        }))
      };

      const url = editingId ? `/api/admin/category-banners/${editingId}` : "/api/admin/category-banners";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingId ? "Banner campaign updated successfully" : "New banner campaign published successfully");
        resetForm();
        fetchDashboardData();
        setActiveTab("campaigns");
      } else {
        showToast(data.error || "Failed to save banner", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save banner", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit banner click
  const handleEditClick = (b: BannerCampaign) => {
    setEditingId(b._id);
    setFormTitle(b.title);
    setFormName(b.name);
    setFormAltText(b.altText || "");
    setFormLinkUrl(b.linkUrl || "");
    setFormOpenInNewTab(b.openInNewTab || false);
    setFormStartDate(b.startDate ? new Date(b.startDate).toISOString().slice(0, 16) : "");
    setFormEndDate(b.endDate ? new Date(b.endDate).toISOString().slice(0, 16) : "");
    setFormPriority(b.priority || 10);
    setFormIsActive(b.isActive);
    setFormTargetDevice(b.targetDevice || "all");
    setFormAllCategories(b.allCategories);
    setFormAutoApplyFuture(b.autoApplyFuture ?? true);
    setDesktopImage(b.desktopImage);
    setMobileImage(b.mobileImage);
    setSelectedCategories(
      (b.appliedCategories || []).map((c) => ({
        id: String(c.categoryId),
        name: c.name,
        slug: c.slug,
        type: c.categoryType || "category1",
        typeLabel: "Category"
      }))
    );
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle active state
  const handleToggleActive = async (b: BannerCampaign) => {
    try {
      const newActive = !b.isActive;
      const res = await fetch(`/api/admin/category-banners/${b._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Banner campaign '${b.title}' ${newActive ? "activated" : "deactivated"}`);
        fetchDashboardData();
      } else {
        showToast(data.error || "Failed to update banner", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update banner", "error");
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id: string, title: string) => {
    if (!confirm(`Delete banner '${title}'?\nAll affected categories will immediately restore their original banners.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/category-banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Banner deleted and previous category banners restored");
        fetchDashboardData();
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch (err) {
      showToast("Error deleting banner", "error");
    }
  };

  // Trigger Redis Cache Refresh
  const handleRefreshRedis = async () => {
    try {
      setIsRefreshingRedis(true);
      const res = await fetch("/api/admin/category-banners/redis/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allCategories: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Redis cache refreshed successfully for all categories");
        fetchDashboardData();
      } else {
        showToast(data.error || "Redis refresh failed", "error");
      }
    } catch (err: any) {
      showToast("Redis refresh failed", "error");
    } finally {
      setIsRefreshingRedis(false);
    }
  };

  // Trigger Background Batch Job
  const handleTriggerBulkJob = async (bannerId: string) => {
    try {
      const res = await fetch("/api/admin/category-banners/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerId, type: "BULK_APPLY", batchSize: 50 })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Background update job started");
        setActiveJobId(data.jobId);
        setActiveJobData(data.job);
        setActiveTab("queue");
      } else {
        showToast(data.error || "Failed to start job", "error");
      }
    } catch (err) {
      showToast("Failed to initiate background job", "error");
    }
  };

  // Poll active background job
  useEffect(() => {
    if (!activeJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/category-banners/jobs/${activeJobId}`);
        const data = await res.json();
        if (data.success) {
          setActiveJobData(data.job);
          if (data.job.status === "completed" || data.job.status === "failed" || data.job.status === "cancelled") {
            clearInterval(interval);
            fetchDashboardData();
            showToast(`Batch job ${data.job.status} (${data.job.processedCategories}/${data.job.totalCategories} categories updated)`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeJobId, fetchDashboardData, showToast]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormName("");
    setFormAltText("");
    setFormLinkUrl("");
    setFormOpenInNewTab(false);
    setFormStartDate("");
    setFormEndDate("");
    setFormPriority(10);
    setFormIsActive(true);
    setFormAllCategories(false);
    setFormAutoApplyFuture(true);
    setDesktopImage(null);
    setMobileImage(null);
    setSelectedCategories([]);
    setSelectedCategoryLevel("all");
  };

  return (
    <div className="w-full min-h-screen bg-[#fafaf9] text-zinc-900 pb-16 font-sans antialiased">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            notification.type === "success"
              ? "bg-[#5e1628] text-white"
              : notification.type === "error"
              ? "bg-zinc-900 text-rose-300 border border-rose-800"
              : "bg-zinc-800 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 width={17} height={17} className="text-rose-200" />
          ) : (
            <AlertCircle width={17} height={17} className="text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-zinc-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
              Category Banner Management
            </h1>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-md border border-stone-200">
              Laptop & Mobile
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure homepage-matching responsive banners across Category 1, 2, 3, 4, 5 and Mobile views.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefreshRedis}
            disabled={isRefreshingRedis}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#5e1628] hover:bg-[#48101e] text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw width={14} height={14} className={isRefreshingRedis ? "animate-spin" : ""} />
            <span>{isRefreshingRedis ? "Refreshing Redis..." : "Refresh Redis Cache"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 space-y-5">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total Categories</span>
            <span className="text-2xl font-bold text-zinc-900 mt-1">
              {stats.totalCategories.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400 mt-auto pt-0.5">Levels 1 through 5</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Active Banners</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1">
              {stats.activeBannerCount}
            </span>
            <span className="text-[10px] text-zinc-400 mt-auto pt-0.5">Live on website</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Inactive Banners</span>
            <span className="text-2xl font-bold text-zinc-600 mt-1">
              {stats.inactiveBannerCount}
            </span>
            <span className="text-[10px] text-zinc-400 mt-auto pt-0.5">Paused campaigns</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Categories Covered</span>
            <span className="text-2xl font-bold text-[#5e1628] mt-1">
              {stats.categoriesUsingBanner.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400 mt-auto pt-0.5">Displaying custom banners</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-2.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "create"
                ? "bg-[#5e1628] text-white shadow-xs"
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Sparkles width={14} height={14} />
            <span>{editingId ? "Edit Campaign" : "New Banner Campaign"}</span>
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-[#5e1628] text-white shadow-xs"
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Layers width={14} height={14} />
            <span>Campaigns ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "queue"
                ? "bg-[#5e1628] text-white shadow-xs"
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <Zap width={14} height={14} />
            <span>Background Queue {jobs.some((j) => j.status === "processing") && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#5e1628] text-white shadow-xs"
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
            }`}
          >
            <History width={14} height={14} />
            <span>Changelog</span>
          </button>
        </div>

        {/* TAB 1: CREATE / EDIT BANNER */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Form Details & Uploader (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Card 1: Banner Images (Desktop 3:1 & Mobile 2:1 matching Homepage) */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 flex-wrap gap-2">
                  <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Upload width={16} height={16} className="text-[#5e1628]" />
                    Banner Creatives
                  </h2>
                  <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Upload 1 banner or both (Auto-adapts for all devices)
                  </span>
                </div>

                {/* Laptop / Desktop Upload Box with Media Library Picker */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Monitor width={14} height={14} className="text-zinc-500" />
                      Laptop / Desktop Banner (1200 × 400 • 3:1 Ratio)
                    </span>
                    {desktopImage ? (
                      <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 width={13} height={13} /> Ready
                      </span>
                    ) : mobileImage ? (
                      <span className="text-amber-700 text-[11px] font-medium flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                        Auto-using Mobile banner
                      </span>
                    ) : null}
                  </div>

                  {desktopImage ? (
                    <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group">
                      <Image src={desktopImage.url} alt="Desktop banner" fill className="object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker("desktop")}
                          className="px-3 py-1.5 bg-[#5e1628] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#48101e] flex items-center gap-1.5"
                        >
                          <FolderOpen width={13} height={13} />
                          <span>Media Folders</span>
                        </button>
                        <label className="cursor-pointer px-3 py-1.5 bg-white text-zinc-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-zinc-100">
                          Upload PC
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "desktop")} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setDesktopImage(null)}
                          className="px-3 py-1.5 bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-rose-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 hover:border-[#5e1628] bg-[#fbfbfa] rounded-xl p-5 flex flex-col items-center justify-center transition-colors text-center">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#5e1628] mb-2">
                        {isUploadingDesktop ? <RefreshCw width={18} height={18} className="animate-spin" /> : <Monitor width={20} height={20} />}
                      </div>
                      <span className="text-xs font-bold text-zinc-800">
                        {isUploadingDesktop ? "Uploading laptop banner..." : "Select or Upload Laptop Banner"}
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-0.5 mb-3">1200 × 400 pixels • 3:1 Ratio (Auto-adapts to mobile if only desktop is uploaded)</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker("desktop")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#5e1628] hover:bg-[#48101e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <FolderOpen width={14} height={14} />
                          <span>Browse Media Folders</span>
                        </button>

                        <label className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 border border-stone-300 cursor-pointer">
                          <Upload width={14} height={14} />
                          <span>Upload from PC</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "desktop")} disabled={isUploadingDesktop} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Phone Upload Box with Media Library Picker */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smartphone width={14} height={14} className="text-zinc-500" />
                      Mobile Phone Banner (480 × 240 • 2:1 Ratio)
                    </span>
                    {mobileImage ? (
                      <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 width={13} height={13} /> Ready
                      </span>
                    ) : desktopImage ? (
                      <span className="text-amber-700 text-[11px] font-medium flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                        Auto-using Desktop banner
                      </span>
                    ) : null}
                  </div>

                  {mobileImage ? (
                    <div className="relative w-full aspect-[2/1] max-w-xs rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group">
                      <Image src={mobileImage.url} alt="Mobile banner" fill className="object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker("mobile")}
                          className="px-2.5 py-1 bg-[#5e1628] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#48101e] flex items-center gap-1"
                        >
                          <FolderOpen width={12} height={12} />
                          <span>Folders</span>
                        </button>
                        <label className="cursor-pointer px-2.5 py-1 bg-white text-zinc-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-zinc-100">
                          PC
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "mobile")} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setMobileImage(null)}
                          className="px-2.5 py-1 bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-rose-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 hover:border-[#5e1628] bg-[#fbfbfa] rounded-xl p-5 flex flex-col items-center justify-center transition-colors text-center">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#5e1628] mb-2">
                        {isUploadingMobile ? <RefreshCw width={18} height={18} className="animate-spin" /> : <Smartphone width={20} height={20} />}
                      </div>
                      <span className="text-xs font-bold text-zinc-800">
                        {isUploadingMobile ? "Uploading mobile banner..." : "Select or Upload Mobile Banner"}
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-0.5 mb-3">480 × 240 pixels • 2:1 Ratio (Optional - auto-adapts from laptop banner)</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenMediaPicker("mobile")}
                          className="px-3.5 py-1.5 rounded-lg bg-[#5e1628] hover:bg-[#48101e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <FolderOpen width={14} height={14} />
                          <span>Browse Media Folders</span>
                        </button>

                        <label className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 border border-stone-300 cursor-pointer">
                          <Upload width={14} height={14} />
                          <span>Upload from PC</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "mobile")} disabled={isUploadingMobile} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Banner Details & Scheduling */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="border-b border-zinc-100 pb-2.5">
                  <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Edit3 width={16} height={16} className="text-[#5e1628]" />
                    Campaign Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Banner Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Festive Special Sale 2026"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Internal Campaign Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. festive_sale_august"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Alt Text (SEO Description)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special festive discounts on premium flowers and cakes"
                    value={formAltText}
                    onChange={(e) => setFormAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Destination Link URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /flowers or /cakes"
                      value={formLinkUrl}
                      onChange={(e) => setFormLinkUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Open In New Tab
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormOpenInNewTab(!formOpenInNewTab)}
                      className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        formOpenInNewTab
                          ? "bg-rose-50 border-[#5e1628] text-[#5e1628]"
                          : "bg-zinc-50 border-zinc-300 text-zinc-600"
                      }`}
                    >
                      <ExternalLink width={13} height={13} />
                      <span>{formOpenInNewTab ? "New Tab" : "Same Window"}</span>
                    </button>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1 flex items-center gap-1">
                      <Calendar width={12} height={12} className="text-zinc-400" />
                      Start Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1 flex items-center gap-1">
                      <Clock width={12} height={12} className="text-zinc-400" />
                      End Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Priority Order (1-100)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formPriority}
                      onChange={(e) => setFormPriority(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Campaign Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className={`w-full py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formIsActive
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                      }`}
                    >
                      <Power width={13} height={13} />
                      <span>{formIsActive ? "Status: Active" : "Status: Inactive"}</span>
                    </button>
                  </div>
                </div>

                {/* Device Target Visibility Selection */}
                <div className="pt-2.5 border-t border-zinc-100 space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Target Devices (Where to show this banner)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormTargetDevice("all")}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formTargetDevice === "all"
                          ? "bg-[#5e1628] text-white border-[#5e1628] shadow-xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <span>🌐 All Devices</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTargetDevice("desktop")}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formTargetDevice === "desktop"
                          ? "bg-[#5e1628] text-white border-[#5e1628] shadow-xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <Monitor width={14} height={14} />
                      <span>Laptop Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTargetDevice("mobile")}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formTargetDevice === "mobile"
                          ? "bg-[#5e1628] text-white border-[#5e1628] shadow-xs"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <Smartphone width={14} height={14} />
                      <span>Phone / iPad</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {formTargetDevice === "all"
                      ? "✨ This banner will be shown responsively on all devices (Laptops, Desktops, iPads and Phones)."
                      : formTargetDevice === "desktop"
                      ? "💻 This banner will only be visible on Laptop and Desktop PC screens."
                      : "📱 This banner will only be visible on Mobile Phones and iPad/Tablet screens."}
                  </p>
                </div>
              </div>

              {/* Card 3: Multi-Select Category Dropdown & Selector with Category 1, 2, 3, 4, 5 Tabs */}
              <div className="bg-white rounded-xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                  <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Filter width={16} height={16} className="text-[#5e1628]" />
                    Target Categories (Category 1, 2, 3, 4, 5)
                  </h2>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formAllCategories}
                        onChange={(e) => handleSelectAllCategories(e.target.checked)}
                        className="rounded text-[#5e1628] focus:ring-[#5e1628] accent-[#5e1628]"
                      />
                      <span>Select All Categories</span>
                    </label>

                    {selectedCategories.length > 0 && !formAllCategories && (
                      <button
                        type="button"
                        onClick={handleClearSelectedCategories}
                        className="text-xs text-zinc-500 hover:text-rose-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Auto-apply to future categories */}
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="font-medium text-stone-700">
                    Apply this banner to any new category created in the future
                  </span>
                  <input
                    type="checkbox"
                    checked={formAutoApplyFuture}
                    onChange={(e) => setFormAutoApplyFuture(e.target.checked)}
                    className="rounded text-[#5e1628] accent-[#5e1628] h-3.5 w-3.5"
                  />
                </div>

                {!formAllCategories ? (
                  <div className="space-y-2.5">
                    {/* Category Level Filter Tabs: All, Category 1, 2, 3, 4, 5, Mobile */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: "all", label: "All Categories" },
                        { id: "category1", label: "Category 1" },
                        { id: "category2", label: "Category 2 (Topics)" },
                        { id: "category3", label: "Category 3 (SubTopics)" },
                        { id: "category4", label: "Category 4" },
                        { id: "category5", label: "Category 5" },
                        { id: "catalogue", label: "Mobile Categories" },
                        { id: "addon", label: "Addon Categories" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedCategoryLevel(tab.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                            selectedCategoryLevel === tab.id
                              ? "bg-[#5e1628] text-white"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input & Level-Specific Select All Button */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search categories (e.g. Flowers, Cakes, Delhi, etc...)"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-300 text-xs focus:outline-none focus:border-[#5e1628] bg-white"
                        />
                        {categorySearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCategorySearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                          >
                            <X width={14} height={14} />
                          </button>
                        )}
                      </div>

                      {/* Level Specific Select All Button */}
                      <button
                        type="button"
                        onClick={handleToggleSelectAllForLevel}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                          isCurrentLevelAllSelected
                            ? "bg-rose-50 border border-[#5e1628] text-[#5e1628] hover:bg-rose-100"
                            : "bg-stone-100 border border-stone-300 text-stone-800 hover:bg-stone-200"
                        }`}
                      >
                        <CheckCircle2 width={13} height={13} className={isCurrentLevelAllSelected ? "text-[#5e1628]" : "text-stone-500"} />
                        <span>{levelSelectAllLabel}</span>
                      </button>
                    </div>

                    {/* Counter */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{selectedCategories.length} total categories selected</span>
                      {isSearchingCategories && <span className="text-[#5e1628]">Searching...</span>}
                    </div>

                    {/* Selected Category Chips */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-2 bg-stone-50 rounded-lg border border-stone-200">
                        {selectedCategories.map((cat) => (
                          <span
                            key={`${cat.type}_${cat.id || cat.slug}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-stone-300 text-zinc-800 text-[11px] font-medium shadow-2xs"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[9px] text-zinc-400">({cat.typeLabel})</span>
                            <button
                              type="button"
                              onClick={() => toggleCategorySelection(cat)}
                              className="text-zinc-400 hover:text-rose-700 ml-0.5"
                            >
                              <X width={11} height={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Category List Picker */}
                    <div className="border border-zinc-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-zinc-100 bg-white">
                      {filteredAvailableCategories.length === 0 ? (
                        <div className="p-4 text-center text-xs text-zinc-400">
                          {isSearchingCategories
                            ? "Loading categories..."
                            : categorySearchQuery
                            ? `No categories matching "${categorySearchQuery}" found in this tab.`
                            : "No categories available in this level."}
                        </div>
                      ) : (
                        filteredAvailableCategories.map((cat) => {
                          const isSelected = selectedCategories.some(
                            (c) => (c.id && cat.id ? c.id === cat.id : c.slug === cat.slug && c.type === cat.type)
                          );
                          return (
                            <div
                              key={`${cat.type}_${cat.id || cat.slug}`}
                              onClick={() => toggleCategorySelection(cat)}
                              className={`px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                isSelected ? "bg-rose-50/70 font-semibold text-[#5e1628]" : "hover:bg-zinc-50 text-zinc-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden pr-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="rounded text-[#5e1628] accent-[#5e1628] shrink-0"
                                />
                                <span className="truncate">{cat.name}</span>
                                {cat.fullPath && (
                                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">({cat.fullPath})</span>
                                )}
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                                {cat.typeLabel}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 width={16} height={16} className="text-emerald-700 shrink-0" />
                    <span>This banner will display across <strong>all categories</strong> on the website.</span>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={isLoading}
                  className="flex-1 py-3 px-5 rounded-lg bg-[#5e1628] hover:bg-[#48101e] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check width={16} height={16} />
                  <span>{editingId ? "Update Banner Campaign" : "Publish Banner Campaign"}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-3 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Device Preview (5 cols) matching Homepage Aspect Ratios */}
            <div className="lg:col-span-5 sticky top-20 space-y-3.5">
              <div className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3">
                  <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <Eye width={15} height={15} className="text-[#5e1628]" />
                    Banner Preview
                  </h3>

                  <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        previewDevice === "desktop" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"
                      }`}
                    >
                      <Monitor width={12} height={12} />
                      <span>Desktop (3:1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        previewDevice === "mobile" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500"
                      }`}
                    >
                      <Smartphone width={12} height={12} />
                      <span>Mobile (2:1)</span>
                    </button>
                  </div>
                </div>

                {/* Device Viewport Simulation */}
                {previewDevice === "desktop" ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
                      <span>Homepage Desktop Ratio (1200 × 400)</span>
                      <span className="text-zinc-400">Aspect 3:1</span>
                    </div>

                    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-100 p-2 shadow-inner">
                      <div className="flex items-center gap-1.5 pb-2 px-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        <span className="text-[10px] text-zinc-400 font-mono ml-2">floriwish.com/category</span>
                      </div>

                      <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-zinc-200">
                        {desktopImage?.url || mobileImage?.url ? (
                          <Image src={desktopImage?.url || mobileImage?.url || ""} alt={formAltText || "Desktop Preview"} fill className="object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-xs">
                            <Monitor width={20} height={20} className="mb-1" />
                            <span>No Banner Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="text-[11px] font-medium text-zinc-500 w-full flex items-center justify-between">
                      <span>Homepage Mobile Ratio (480 × 240)</span>
                      <span className="text-zinc-400">Aspect 2:1</span>
                    </div>

                    <div className="w-60 border-2 border-zinc-700 rounded-2xl p-2 bg-white shadow-md">
                      <div className="w-12 h-2 bg-zinc-700 rounded-full mx-auto mb-2" />
                      <div className="text-[10px] font-bold text-zinc-700 pb-1 text-center">Floriwish Mobile</div>

                      <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-zinc-100 my-1.5">
                        {mobileImage?.url || desktopImage?.url ? (
                          <Image src={mobileImage?.url || desktopImage?.url || ""} alt={formAltText || "Mobile Preview"} fill className="object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-[10px]">
                            <Smartphone width={18} height={18} className="mb-1" />
                            <span>No Banner Selected</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1">
                        <div className="h-12 bg-zinc-100 rounded" />
                        <div className="h-12 bg-zinc-100 rounded" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campaign Metadata */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-600">
                    <span>Title:</span>
                    <span className="font-semibold text-zinc-900">{formTitle || "Untitled"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Destination:</span>
                    <span className="font-semibold text-zinc-900">{formLinkUrl || "None"}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Selected Categories:</span>
                    <span className="font-semibold text-[#5e1628]">
                      {formAllCategories ? "All Categories" : `${selectedCategories.length} categories`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE CAMPAIGNS & HISTORY */}
        {activeTab === "campaigns" && (
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Campaigns ({banners.length})</h2>
                <p className="text-xs text-zinc-500">Manage live status, edit creatives, or trigger background batch sync.</p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("create");
                }}
                className="px-3 py-1.5 bg-[#5e1628] hover:bg-[#48101e] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Sparkles width={13} height={13} />
                <span>Add Banner</span>
              </button>
            </div>

            {banners.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                No banner campaigns created yet. Click &quot;Add Banner&quot; to create one.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Creatives</th>
                      <th className="py-2.5 px-4">Campaign Title</th>
                      <th className="py-2.5 px-4">Coverage</th>
                      <th className="py-2.5 px-4">Priority / Schedule</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {banners.map((b) => (
                      <tr key={b._id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-14 h-7 rounded overflow-hidden bg-zinc-100 border border-zinc-200">
                              {b.desktopImage?.url && (
                                <Image src={b.desktopImage.url} alt="Desk" fill className="object-cover" />
                              )}
                            </div>
                            <div className="relative w-7 h-7 rounded overflow-hidden bg-zinc-100 border border-zinc-200">
                              {b.mobileImage?.url && (
                                <Image src={b.mobileImage.url} alt="Mob" fill className="object-cover" />
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-4">
                          <div className="font-bold text-zinc-900">{b.title}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{b.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-medium border bg-zinc-50 text-zinc-600 border-zinc-200">
                              {b.targetDevice === "desktop" ? "💻 Laptop Only" : b.targetDevice === "mobile" ? "📱 Phone & iPad" : "🌐 All Devices"}
                            </span>
                          </div>
                          {b.linkUrl && (
                            <div className="text-[10px] text-[#5e1628] underline truncate max-w-[160px] mt-0.5">{b.linkUrl}</div>
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          {b.allCategories ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200 text-[10px]">
                              All Categories ({stats.totalCategories})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-medium border border-stone-200 text-[10px]">
                              {(b.appliedCategories || []).length} Categories
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-zinc-500">
                          <div>Priority: <strong className="text-zinc-800">{b.priority}</strong></div>
                          {b.startDate || b.endDate ? (
                            <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Clock width={10} height={10} />
                              <span>Scheduled</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-400">Always Active</div>
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => handleToggleActive(b)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              b.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? "bg-emerald-600" : "bg-zinc-400"}`} />
                            <span>{b.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            title="Start Background Batch Sync"
                            onClick={() => handleTriggerBulkJob(b._id)}
                            className="p-1 hover:bg-zinc-100 rounded text-zinc-600 hover:text-[#5e1628]"
                          >
                            <Zap width={15} height={15} />
                          </button>
                          <button
                            title="Edit Campaign"
                            onClick={() => handleEditClick(b)}
                            className="p-1 hover:bg-zinc-100 rounded text-zinc-600 hover:text-zinc-900"
                          >
                            <Edit3 width={15} height={15} />
                          </button>
                          <button
                            title="Delete Campaign"
                            onClick={() => handleDeleteBanner(b._id, b.title)}
                            className="p-1 hover:bg-rose-50 rounded text-zinc-400 hover:text-rose-700"
                          >
                            <Trash2 width={15} height={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BACKGROUND QUEUE & JOBS */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            {activeJobData && (
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-sm font-bold text-zinc-900">
                      Processing: {activeJobData.bannerTitle}
                    </h3>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-[#5e1628] font-semibold uppercase">
                    {activeJobData.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700">
                    <span>
                      ✓ {activeJobData.processedCategories} / {activeJobData.totalCategories} Categories Synchronized
                    </span>
                    <span>
                      {Math.round((activeJobData.processedCategories / (activeJobData.totalCategories || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5e1628] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round((activeJobData.processedCategories / (activeJobData.totalCategories || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 text-zinc-200 rounded-lg font-mono text-xs max-h-36 overflow-y-auto space-y-1">
                  {(activeJobData.logs || []).map((log, idx) => (
                    <div key={idx} className="text-[11px]">
                      <span className="text-zinc-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-900">Background Job History</h3>
              </div>

              {jobs.length === 0 ? (
                <div className="p-6 text-center text-zinc-400 text-xs">No background jobs recorded.</div>
              ) : (
                <div className="divide-y divide-zinc-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Job ID</th>
                        <th className="py-2.5 px-4">Banner Target</th>
                        <th className="py-2.5 px-4">Progress</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Started At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {jobs.map((j) => (
                        <tr key={j._id} className="hover:bg-zinc-50">
                          <td className="py-2.5 px-4 font-mono text-zinc-500 text-[11px]">{j._id.slice(-8)}</td>
                          <td className="py-2.5 px-4 font-bold text-zinc-800">{j.bannerTitle}</td>
                          <td className="py-2.5 px-4">
                            {j.processedCategories} / {j.totalCategories} ({j.totalBatches} batches)
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                                j.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : j.status === "processing"
                                  ? "bg-rose-100 text-[#5e1628]"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {j.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-zinc-400 text-[11px]">
                            {j.startedAt ? new Date(j.startedAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT CHANGELOG */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">Audit Trail & Action Logs</h3>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs">No audit logs recorded.</div>
            ) : (
              <div className="divide-y divide-zinc-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Banner Target</th>
                      <th className="py-2.5 px-4">Affected</th>
                      <th className="py-2.5 px-4">Performed By</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                              log.action === "CREATE"
                                ? "bg-emerald-100 text-emerald-800"
                                : log.action === "UPDATE"
                                ? "bg-blue-100 text-blue-800"
                                : log.action === "DELETE"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-zinc-800">{log.bannerTitle || "General"}</td>
                        <td className="py-2.5 px-4 font-medium text-zinc-600">{log.affectedCategoriesCount}</td>
                        <td className="py-2.5 px-4 text-zinc-700">{log.performedBy}</td>
                        <td className="py-2.5 px-4 text-zinc-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-2.5 px-4 text-zinc-500 max-w-xs truncate">{log.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Library Full Modal Popup with Folders & Images */}
      {showMediaPicker && (
        <ImageManagement
          manage="image"
          asPopup={true}
          openPopup={showMediaPicker}
          onChangeOpenPopup={setShowMediaPicker}
          selectMultiple={false}
          onSelect={handleMediaImageSelected}
        />
      )}
    </div>
  );
}
