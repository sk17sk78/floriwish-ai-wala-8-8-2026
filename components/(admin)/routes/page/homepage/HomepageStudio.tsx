"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X_API_KEY } from "@/common/constants/environmentVariables";
import {
  Globe,
  Layout,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Layers,
  X,
  Heading,
  Code,
  Smartphone,
  Monitor,
  Menu,
  CreditCard,
  Zap,
  Download,
  Share2
} from "lucide-react";

export default function HomepageStudio() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"seo" | "sections" | "header" | "footer" | "advanced">("seo");

  // Core Configuration State
  const [config, setConfig] = useState<any>(null);
  const [originalConfig, setOriginalConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // SEO Tab States
  const [seoPreviewDevice, setSeoPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [newKeyword, setNewKeyword] = useState("");
  const [jsonLdError, setJsonLdError] = useState<string | null>(null);

  // Content Sections Tab States
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);

  // Header Tab States
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [newSubmenuLabel, setNewSubmenuLabel] = useState("");
  const [newSubmenuPath, setNewSubmenuPath] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; message: string } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Fetch Homepage Configurations
  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/homepage-management", {
        headers: { "x-api-key": X_API_KEY },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        setOriginalConfig(JSON.parse(JSON.stringify(data.data)));
        setHasUnsavedChanges(false);
      }
    } catch {
      showToast("Failed to load homepage configurations", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Track Unsaved Changes
  const updateConfig = (updater: (prev: any) => any) => {
    setConfig((prev: any) => {
      const next = updater(prev);
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Save & Publish
  const handleSave = async (publishLive: boolean = true) => {
    if (!config) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/homepage-management", {
        method: "POST",
        headers: {
          "x-api-key": X_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config,
          publishLive,
          author: "Super Admin",
          activeTabName: activeTab.toUpperCase(),
          changesSummary: publishLive ? "Published live homepage changes" : "Saved draft homepage updates",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalConfig(JSON.parse(JSON.stringify(config)));
        setHasUnsavedChanges(false);
        showToast(publishLive ? "Homepage published live successfully" : "Draft saved successfully", "success");
      } else {
        showToast(data.error || "Failed to save configuration", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard Changes
  const handleDiscard = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)));
      setHasUnsavedChanges(false);
      showToast("Discarded unsaved changes", "info");
    }
  };

  // SEO Score calculation
  const seoScoreData = useMemo(() => {
    if (!config?.seo) return { score: 0, checklist: [] };
    const { pageTitle, metaTitle, metaDescription, metaKeywords, canonicalUrl, ogImage, twitterImage, structuredData } = config.seo;

    const checklist = [
      { id: "h1", label: "Page H1 Title Defined", passed: Boolean(pageTitle && pageTitle.trim().length > 5) },
      { id: "title_len", label: "Meta Title Length (40-65 Chars)", passed: Boolean(metaTitle && metaTitle.length >= 40 && metaTitle.length <= 65) },
      { id: "desc_len", label: "Meta Description Length (120-165 Chars)", passed: Boolean(metaDescription && metaDescription.length >= 120 && metaDescription.length <= 165) },
      { id: "keywords", label: "Keywords Added (4+ Tags)", passed: Boolean(metaKeywords && metaKeywords.length >= 4) },
      { id: "canonical", label: "Canonical URL Configured", passed: Boolean(canonicalUrl && canonicalUrl.startsWith("http")) },
      { id: "og_image", label: "OpenGraph Image Configured", passed: Boolean(ogImage && ogImage.trim().length > 0) },
      { id: "twitter", label: "Twitter Card Configured", passed: Boolean(twitterImage && twitterImage.trim().length > 0) },
      { id: "jsonld", label: "Structured Data (JSON-LD) Valid", passed: Boolean(structuredData && !jsonLdError) },
    ];

    const passedCount = checklist.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checklist.length) * 100);

    return { score, checklist };
  }, [config?.seo, jsonLdError]);

  const validateJsonLd = (code: string) => {
    try {
      JSON.parse(code);
      setJsonLdError(null);
    } catch (e: any) {
      setJsonLdError(e.message);
    }
  };

  // Section Reordering
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (!config?.sections) return;
    const newSections = [...config.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    updateConfig((prev) => ({ ...prev, sections: newSections }));
  };

  const handleToggleSectionVisibility = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s: any) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    }));
  };

  const handleDeleteSection = (id: string) => {
    updateConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((s: any) => s.id !== id),
    }));
    showToast("Section removed", "info");
  };

  const handleDuplicateSection = (sec: any) => {
    const duplicated = {
      ...sec,
      id: `sec_${Date.now()}`,
      name: `${sec.name} (Copy)`,
      order: (config?.sections?.length || 0) + 1,
      status: "draft",
    };
    updateConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, duplicated],
    }));
    showToast(`Duplicated ${sec.name}`, "success");
  };

  const handleAddSectionPreset = (preset: { name: string; type: string; subtitle: string }) => {
    const newSec = {
      id: `sec_${Date.now()}`,
      name: preset.name,
      type: preset.type,
      subtitle: preset.subtitle,
      status: "published",
      scheduleDate: null,
      isVisible: true,
      order: (config?.sections?.length || 0) + 1,
      config: {},
    };
    updateConfig((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSec],
    }));
    setIsAddSectionModalOpen(false);
    showToast(`Added ${preset.name}`, "success");
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const current = config?.seo?.metaKeywords || [];
    if (!current.includes(newKeyword.trim())) {
      updateConfig((prev) => ({
        ...prev,
        seo: { ...prev.seo, metaKeywords: [...current, newKeyword.trim()] },
      }));
    }
    setNewKeyword("");
  };

  const handleRemoveKeyword = (tag: string) => {
    updateConfig((prev) => ({
      ...prev,
      seo: { ...prev.seo, metaKeywords: prev.seo.metaKeywords.filter((k: string) => k !== tag) },
    }));
  };

  const handleClearCache = async () => {
    try {
      showToast("Clearing homepage cache...", "info");
      const res = await fetch("/api/admin/reset-cache/redis", {
        method: "POST",
        headers: { "x-api-key": X_API_KEY },
      });
      if (res.ok) {
        showToast("Homepage cache cleared successfully", "success");
      }
    } catch {
      showToast("Failed to clear cache", "error");
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floriwish_homepage_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported configuration JSON", "success");
  };

  if (isLoading || !config) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw width={24} height={24} className="animate-spin text-[#ad2355]" />
        <span className="text-xs font-semibold text-zinc-500">Loading Homepage Settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-5 font-sans text-zinc-900 pb-28">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold transition-all border ${
            toast.type === "success"
              ? "bg-zinc-900 text-white border-zinc-800"
              : toast.type === "error"
              ? "bg-rose-900 text-white border-rose-800"
              : toast.type === "warning"
              ? "bg-amber-900 text-white border-amber-800"
              : "bg-zinc-900 text-white border-zinc-800"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 width={16} height={16} className="text-emerald-400" />}
          {toast.type === "error" && <AlertCircle width={16} height={16} className="text-rose-400" />}
          {toast.type === "warning" && <AlertTriangle width={16} height={16} className="text-amber-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">Homepage Settings & SEO</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {config.advanced?.pageStatus === "published" ? "Live" : "Draft"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure homepage metadata, section ordering, branding, and performance cache.
          </p>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer no-underline"
          >
            <ExternalLink width={14} height={14} />
            <span>View Live Site</span>
          </a>
          <button
            type="button"
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap width={14} height={14} className="text-amber-600" />
            <span>Flush Cache</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "seo" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Globe width={14} height={14} />
            <span>SEO & Metadata</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "sections" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Layers width={14} height={14} />
            <span>Sections & Layout</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-[10px] text-zinc-600 font-mono">
              {config.sections?.length || 9}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("header")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "header" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Menu width={14} height={14} />
            <span>Header & Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("footer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "footer" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <CreditCard width={14} height={14} />
            <span>Footer Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("advanced")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "advanced" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Sliders width={14} height={14} />
            <span>Advanced & Backup</span>
          </button>
        </div>

        {/* Unsaved indicator */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Unsaved Changes</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SEO & METADATA */}
      {/* ========================================================================= */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-5">
            {/* Core Titles & Description */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Heading width={16} height={16} className="text-[#ad2355]" />
                <span>Primary Page Headings & Meta Snippet</span>
              </h2>

              {/* H1 Heading */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                  <span>Page Title (H1 Heading)</span>
                  <span className="text-[10px] text-zinc-400">Displayed in rich search snippets</span>
                </label>
                <input
                  type="text"
                  value={config.seo?.pageTitle || ""}
                  onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, pageTitle: e.target.value } }))}
                  placeholder="e.g. Send Flowers, Cakes & Gifts Online Across India"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/10"
                />
              </div>

              {/* Meta Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">SEO Meta Title</label>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      (config.seo?.metaTitle?.length || 0) >= 40 && (config.seo?.metaTitle?.length || 0) <= 65
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {config.seo?.metaTitle?.length || 0} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={config.seo?.metaTitle || ""}
                  onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                  placeholder="e.g. Floriwish - Online Flower, Cake & Gift Delivery in 2 Hours"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/10"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">SEO Meta Description</label>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      (config.seo?.metaDescription?.length || 0) >= 120 && (config.seo?.metaDescription?.length || 0) <= 165
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {config.seo?.metaDescription?.length || 0} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={config.seo?.metaDescription || ""}
                  onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                  placeholder="e.g. Order fresh flower bouquets, gourmet cakes, and midnight surprise gifts with free same-day express delivery across India."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/10"
                />
              </div>

              {/* Canonical URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Canonical URL</label>
                <input
                  type="text"
                  value={config.seo?.canonicalUrl || ""}
                  onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, canonicalUrl: e.target.value } }))}
                  placeholder="https://floriwish.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm font-mono text-zinc-600 focus:outline-none focus:border-[#ad2355]"
                />
              </div>
            </div>

            {/* Keyword Tags */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900">Meta Keywords & Tags</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Add target keyword (e.g. online flower delivery)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-[#ad2355] hover:bg-[#8e1944] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(config.seo?.metaKeywords || []).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(tag)}
                      className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X width={12} height={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* OpenGraph & Social Sharing */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Share2 width={16} height={16} className="text-[#ad2355]" />
                <span>Social Sharing & OpenGraph Media</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">OpenGraph Image URL</label>
                  <input
                    type="text"
                    value={config.seo?.ogImage || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, ogImage: e.target.value } }))}
                    placeholder="https://.../og-banner.webp"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#ad2355]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Twitter Card Image URL</label>
                  <input
                    type="text"
                    value={config.seo?.twitterImage || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, seo: { ...p.seo, twitterImage: e.target.value } }))}
                    placeholder="https://.../twitter-card.webp"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#ad2355]"
                  />
                </div>
              </div>
            </div>

            {/* Structured Data (JSON-LD) */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Code width={16} height={16} className="text-[#ad2355]" />
                  <span>Structured Schema (JSON-LD)</span>
                </h3>
                {jsonLdError ? (
                  <span className="text-[11px] font-semibold text-rose-600">Invalid JSON Syntax</span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600">Valid Schema</span>
                )}
              </div>

              <textarea
                rows={7}
                value={config.seo?.structuredData || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  validateJsonLd(val);
                  updateConfig((p) => ({ ...p, seo: { ...p.seo, structuredData: val } }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs focus:outline-none ${
                  jsonLdError ? "border-rose-400 bg-rose-50/20" : "border-zinc-200 bg-zinc-50/40"
                }`}
              />
            </div>
          </div>

          {/* Right Column: Previews & Checklist */}
          <div className="lg:col-span-5 space-y-5">
            {/* Google Search Live Preview */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Google Search Preview</h3>
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSeoPreviewDevice("desktop")}
                    className={`p-1 rounded cursor-pointer ${seoPreviewDevice === "desktop" ? "bg-white shadow-2xs text-zinc-900" : "text-zinc-400"}`}
                  >
                    <Monitor width={14} height={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoPreviewDevice("mobile")}
                    className={`p-1 rounded cursor-pointer ${seoPreviewDevice === "mobile" ? "bg-white shadow-2xs text-zinc-900" : "text-zinc-400"}`}
                  >
                    <Smartphone width={14} height={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-zinc-200/90 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-600">
                    F
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate font-mono">
                    {config.seo?.canonicalUrl || "https://floriwish.com"}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#1a0dab] hover:underline line-clamp-1 cursor-pointer">
                  {config.seo?.metaTitle || "Floriwish - Online Flower & Gift Delivery"}
                </div>
                <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {config.seo?.metaDescription || "Order fresh bouquets and gifts with express same-day delivery across India."}
                </div>
              </div>
            </div>

            {/* SEO Health Checklist */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">SEO Quality Score</h3>
                <span
                  className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-full ${
                    seoScoreData.score >= 80 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {seoScoreData.score}%
                </span>
              </div>

              <div className="space-y-2">
                {seoScoreData.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    {item.passed ? (
                      <CheckCircle2 width={15} height={15} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle width={15} height={15} className="text-amber-500 shrink-0" />
                    )}
                    <span className={item.passed ? "text-zinc-700" : "text-zinc-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SECTIONS & LAYOUT */}
      {/* ========================================================================= */}
      {activeTab === "sections" && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Homepage Content Flow & Sections</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Drag or use arrows to reorder sections. Toggle visibility or duplicate components.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddSectionModalOpen(true)}
              className="px-4 py-2 bg-[#ad2355] hover:bg-[#8e1944] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus width={14} height={14} />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(config.sections || []).map((sec: any, idx: number) => (
              <div
                key={sec.id || idx}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  sec.isVisible ? "bg-white border-zinc-200/90 shadow-2xs" : "bg-zinc-50 border-zinc-200/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-600 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{sec.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600">
                        {sec.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{sec.subtitle || "No subtitle configured"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, "up")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveUp width={14} height={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === (config.sections?.length || 0) - 1}
                    onClick={() => handleMoveSection(idx, "down")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveDown width={14} height={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSectionVisibility(sec.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                  >
                    {sec.isVisible ? <Eye width={14} height={14} /> : <EyeOff width={14} height={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateSection(sec)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                  >
                    <Plus width={14} height={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 width={14} height={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HEADER & NAVIGATION */}
      {/* ========================================================================= */}
      {activeTab === "header" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-5">
            {/* Announcement Strip */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900">Top Announcement Bar</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.header?.announcementBar?.isEnabled ?? true}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          announcementBar: { ...p.header.announcementBar, isEnabled: e.target.checked },
                        },
                      }))
                    }
                    className="rounded text-[#ad2355]"
                  />
                  <span className="text-xs font-semibold text-zinc-600">Enabled</span>
                </label>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Announcement Text</label>
                  <input
                    type="text"
                    value={config.header?.announcementBar?.text || ""}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          announcementBar: { ...p.header.announcementBar, text: e.target.value },
                        },
                      }))
                    }
                    placeholder="e.g. Free 2-Hour Express Delivery on orders above ₹499"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Action Link (Optional)</label>
                  <input
                    type="text"
                    value={config.header?.announcementBar?.link || ""}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          announcementBar: { ...p.header.announcementBar, link: e.target.value },
                        },
                      }))
                    }
                    placeholder="/offers"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ad2355]"
                  />
                </div>
              </div>
            </div>

            {/* Support Concierge Details */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Header Direct Support Contact</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Support Phone</label>
                  <input
                    type="text"
                    value={config.header?.contactPhone || "+91 8708388018"}
                    onChange={(e) => updateConfig((p) => ({ ...p, header: { ...p.header, contactPhone: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={config.header?.contactWhatsapp || "+91 8708388018"}
                    onChange={(e) => updateConfig((p) => ({ ...p, header: { ...p.header, contactWhatsapp: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {/* Mega Menu Navigation Items */}
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900">Header Navigation Categories</h3>
              <div className="space-y-2">
                {(config.header?.megaMenu || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-800">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 font-mono ml-2">{item.path}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingMenuItem(item)}
                      className="text-xs font-semibold text-[#ad2355] hover:underline cursor-pointer"
                    >
                      Submenus ({item.submenus?.length || 0})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FOOTER DETAILS */}
      {/* ========================================================================= */}
      {activeTab === "footer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Footer Brand & Support Info</h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Company Short Bio</label>
                <textarea
                  rows={3}
                  value={config.footer?.aboutBio || "India's premier online floral & gift delivery platform."}
                  onChange={(e) => updateConfig((p) => ({ ...p, footer: { ...p.footer, aboutBio: e.target.value } }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Support Email</label>
                  <input
                    type="text"
                    value={config.footer?.supportEmail || "care@floriwish.com"}
                    onChange={(e) => updateConfig((p) => ({ ...p, footer: { ...p.footer, supportEmail: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700">Copyright Line</label>
                  <input
                    type="text"
                    value={config.footer?.copyrightText || "© 2026 Floriwish.com. All rights reserved."}
                    onChange={(e) => updateConfig((p) => ({ ...p, footer: { ...p.footer, copyrightText: e.target.value } }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ADVANCED & BACKUP */}
      {/* ========================================================================= */}
      {activeTab === "advanced" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Backup & JSON Data</h3>
              <p className="text-xs text-zinc-500">
                Download current homepage configuration backup or inspect revision snapshot.
              </p>

              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download width={14} height={14} />
                <span>Export Configuration JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STICKY BOTTOM SAVE & ACTION BAR */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-3 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hasUnsavedChanges ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="text-xs font-semibold text-zinc-600 hidden sm:inline">
              {hasUnsavedChanges ? "You have unsaved changes" : "All changes saved"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || isSaving}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-4.5 py-2 rounded-xl bg-[#ad2355] hover:bg-[#8e1944] text-white font-semibold text-xs shadow-sm transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw width={13} height={13} className={isSaving ? "animate-spin" : ""} />
              <span>{isSaving ? "Publishing..." : "Publish Live"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Section Preset Modal */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Add Section to Homepage</h3>
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto">
              {[
                { name: "Hero Banner Slider", type: "hero_banner", subtitle: "Promotional sliding banners" },
                { name: "Popular Categories Grid", type: "categories", subtitle: "Circular & Card category tiles" },
                { name: "Trending Bestsellers", type: "featured_products", subtitle: "Top cake & floral bouquets" },
                { name: "Occasion Specials", type: "occasions", subtitle: "Birthday, Anniversary specials" },
                { name: "Customer Reviews", type: "testimonials", subtitle: "Verified buyer ratings & testimonials" },
                { name: "Gifting Blogs & Guides", type: "blogs", subtitle: "Care tips & gifting journal" },
                { name: "Instagram Social Wall", type: "instagram", subtitle: "Live feed from Instagram" },
                { name: "Interactive FAQs", type: "faqs", subtitle: "Frequently asked questions" },
                { name: "Why Choose Us Badges", type: "trust_badges", subtitle: "2-Hour, Fresh guarantee" },
                { name: "Rich SEO Story Content", type: "about", subtitle: "Keyword-rich narrative" },
              ].map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => handleAddSectionPreset(preset)}
                  className="p-3 text-left rounded-xl border border-zinc-200 hover:border-[#ad2355] hover:bg-rose-50/30 transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-xs text-zinc-900 group-hover:text-[#ad2355]">{preset.name}</div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{preset.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Submenu Modal */}
      {editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900">Edit Submenus for &quot;{editingMenuItem.label}&quot;</h3>
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Submenu label (e.g. Birthday Cakes)"
                value={newSubmenuLabel}
                onChange={(e) => setNewSubmenuLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs"
              />
              <input
                type="text"
                placeholder="Path (/cakes/birthday)"
                value={newSubmenuPath}
                onChange={(e) => setNewSubmenuPath(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newSubmenuLabel || !newSubmenuPath) return;
                  const newSub = { label: newSubmenuLabel, path: newSubmenuPath };
                  updateConfig((p) => ({
                    ...p,
                    header: {
                      ...p.header,
                      megaMenu: p.header.megaMenu.map((m: any) =>
                        m.id === editingMenuItem.id ? { ...m, submenus: [...(m.submenus || []), newSub] } : m
                      ),
                    },
                  }));
                  setNewSubmenuLabel("");
                  setNewSubmenuPath("");
                }}
                className="px-3 py-1.5 bg-[#ad2355] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {(
                config.header?.megaMenu?.find((m: any) => m.id === editingMenuItem.id)?.submenus || []
              ).map((sub: any, sIdx: number) => (
                <div key={sIdx} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-800">{sub.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono ml-2">{sub.path}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig((p) => ({
                        ...p,
                        header: {
                          ...p.header,
                          megaMenu: p.header.megaMenu.map((m: any) =>
                            m.id === editingMenuItem.id
                              ? { ...m, submenus: m.submenus.filter((_: any, i: number) => i !== sIdx) }
                              : m
                          ),
                        },
                      }));
                    }}
                    className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 width={13} height={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
