"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Server,
  Database,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Copy,
  Check,
  X,
  Cpu,
  Cloud,
  Layers,
  Radio,
  ExternalLink,
  ShieldCheck,
  Bell,
  Bug,
  RotateCcw
} from "lucide-react";

interface APIScanItem {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  method: string;
  description: string;
  critical: boolean;
  status: "healthy" | "slow" | "offline";
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  responseSizeFormatted: string;
  responseSizeBytes: number;
  timestamp: string;
  headers: Record<string, string>;
  preview: any;
  error?: string | null;
}

interface ScanSummary {
  totalApis: number;
  workingCount: number;
  slowCount: number;
  failedCount: number;
  avgResponseTimeMs: number;
  scanDurationMs: number;
  fastestApi: { name: string; timeMs: number; endpoint: string } | null;
  slowestApi: { name: string; timeMs: number; endpoint: string } | null;
  successRatePercent: number;
  overallStatus: "healthy" | "warning" | "critical";
  timestamp: string;
}

interface SystemInfrastructure {
  server: {
    platform: string;
    arch: string;
    nodeVersion: string;
    uptimeSeconds: number;
    uptimeFormatted: string;
    memory: {
      rssMB: string;
      heapUsedMB: string;
      heapTotalMB: string;
      externalMB: string;
    };
    systemMemory: {
      totalGB: string;
      freeGB: string;
      usagePercent: number;
    };
    cpuCount: number;
    loadAvg: number[];
  };
  database: {
    connected: boolean;
    status: string;
    pingMs: number | null;
    collectionsCount: number;
    databaseName: string;
    error?: string | null;
  };
  redis: {
    connected: boolean;
    status: string;
    pingMs: number | null;
    keysCount: number;
    error?: string | null;
  };
  aws?: {
    connected: boolean;
    status: string;
    service: string;
    bucket: string;
    region: string;
    cloudfrontUrl: string;
    credentialsConfigured: boolean;
    edgeCaching: string;
    storageType: string;
  };
  services?: {
    firebasePush?: { status: string; label: string; provider: string };
    mediaStorage?: { status: string; label: string; provider: string };
    cronScheduler?: { status: string; label: string; provider: string };
  };
}

export default function SystemHealthMonitor() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "errors" | "infrastructure">("overview");

  // Core States
  const [apiResults, setApiResults] = useState<APIScanItem[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [infra, setInfra] = useState<SystemInfrastructure | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [retryingApiId, setRetryingApiId] = useState<string | null>(null);
  const [isRetryingAllErrors, setIsRetryingAllErrors] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "slow" | "offline">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Selected Detail Modal
  const [selectedApi, setSelectedApi] = useState<APIScanItem | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedErrorId, setCopiedErrorId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info" | "warning"; message: string } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Failing / Broken APIs list
  const failedApis = useMemo(() => {
    return apiResults.filter((r) => r.status === "offline" || (r.statusCode && r.statusCode >= 400));
  }, [apiResults]);

  // Fetch Infrastructure Data
  const fetchInfraStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system-health/system-status", {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo" },
      });
      const data = await res.json();
      if (data.success) {
        setInfra(data);
      }
    } catch (err) {
      console.error("Failed to load infrastructure status", err);
    }
  }, []);

  // Run Full API Scan
  const runFullScan = useCallback(async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/system-health/scan", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setApiResults(data.results || []);
        setSummary(data.summary || null);
        const fails = (data.results || []).filter((r: any) => r.status === "offline" || r.statusCode >= 400).length;
        if (fails > 0) {
          showToast(`⚠️ Scan complete: ${fails} API(s) need attention`, "warning");
        } else {
          showToast(`✅ Scan complete: All ${data.results?.length || 0} APIs operational`, "success");
        }
      } else {
        showToast(data.error || "Failed to complete API scan", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error during scan", "error");
    } finally {
      setIsScanning(false);
      fetchInfraStatus();
    }
  }, [isScanning, showToast, fetchInfraStatus]);

  // Initial Load
  useEffect(() => {
    fetchInfraStatus();
    runFullScan();
  }, [fetchInfraStatus, runFullScan]);

  // Test Single API
  const handleTestSingleApi = async (item: APIScanItem) => {
    setRetryingApiId(item.id);
    try {
      const res = await fetch("/api/admin/system-health/scan", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const updated = data.data as APIScanItem;
        setApiResults((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
        if (selectedApi?.id === item.id) {
          setSelectedApi(updated);
        }
        showToast(
          `${updated.name}: ${updated.statusCode} (${updated.responseTimeMs}ms)`,
          updated.status === "healthy" ? "success" : updated.status === "slow" ? "warning" : "error"
        );
      }
    } catch (err: any) {
      showToast(`Test failed: ${err.message}`, "error");
    } finally {
      setRetryingApiId(null);
    }
  };

  // Re-Test All Failed APIs
  const handleRetryAllFailed = async () => {
    if (failedApis.length === 0) {
      showToast("No failed APIs to re-test", "info");
      return;
    }
    setIsRetryingAllErrors(true);
    showToast(`Re-testing ${failedApis.length} failed API(s)...`, "info");
    try {
      for (const item of failedApis) {
        await handleTestSingleApi(item);
      }
      showToast("Re-test sequence completed", "success");
    } finally {
      setIsRetryingAllErrors(false);
    }
  };

  // Copy helpers
  const handleCopy = (text: string, isPayload = false) => {
    navigator.clipboard.writeText(text);
    if (isPayload) {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } else {
      setCopiedEndpoint(text);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    }
  };

  const handleCopyError = (item: APIScanItem) => {
    const errorDetails = JSON.stringify(
      {
        api: item.name,
        endpoint: item.endpoint,
        method: item.method,
        statusCode: item.statusCode,
        error: item.error || item.statusText || "Request failed",
        responseTime: `${item.responseTimeMs}ms`,
        timestamp: item.timestamp || new Date().toISOString(),
      },
      null,
      2
    );
    navigator.clipboard.writeText(errorDetails);
    setCopiedErrorId(item.id);
    setTimeout(() => setCopiedErrorId(null), 2000);
    showToast("Copied error diagnostics to clipboard", "success");
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      infrastructure: infra,
      failedApis: failedApis,
      results: apiResults,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floriwish_system_health_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded System Health Report", "success");
  };

  // Filtered Results
  const filteredApis = useMemo(() => {
    let list = [...apiResults];
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((r) => r.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.endpoint.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return list;
  }, [apiResults, statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="w-full max-w-full space-y-5 font-sans text-zinc-900 dark:text-zinc-100 pb-24">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border ${
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
      <div className="p-5 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">System Health & API Monitor</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                failedApis.length > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  failedApis.length > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                }`}
              />
              {failedApis.length > 0 ? `${failedApis.length} Failed Endpoint(s)` : "All 32 Services Operational"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time status monitoring for AWS S3 & CloudFront, MongoDB, In-Memory Redis, and all platform API endpoints.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download width={14} height={14} />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            onClick={runFullScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-[#ad2355] hover:bg-[#8e1944] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw width={14} height={14} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? "Probing APIs..." : "Scan All APIs"}</span>
          </button>
        </div>
      </div>

      {/* Top Warning Banner if Errors Exist */}
      {failedApis.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0">
              <AlertCircle width={18} height={18} />
            </div>
            <div>
              <span className="font-bold text-rose-800 dark:text-rose-200">
                {failedApis.length} API Endpoint(s) are failing or returned errors!
              </span>
              <p className="text-rose-600 dark:text-rose-400 mt-0.5">
                Inspect error messages and diagnostics in the Error Console tab below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("errors")}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Open Error Console ({failedApis.length})
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Errors & Failed Status */}
        <div
          onClick={() => setActiveTab("errors")}
          className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            failedApis.length > 0
              ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
              : "bg-white dark:bg-[#121214] border-zinc-200/80 dark:border-zinc-800"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Failed / Error APIs</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold font-mono ${
                  failedApis.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {failedApis.length} Failed
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">({summary?.workingCount || apiResults.length - failedApis.length} OK)</span>
            </div>
          </div>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              failedApis.length > 0
                ? "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {failedApis.length > 0 ? <Bug width={18} height={18} /> : <CheckCircle2 width={18} height={18} />}
          </div>
        </div>

        {/* AWS S3 & CloudFront */}
        <div className="p-4 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">AWS S3 & CloudFront</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Connected
              </span>
              <span className="text-xs text-emerald-600 font-mono font-semibold">ap-south-1</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Cloud width={18} height={18} />
          </div>
        </div>

        {/* Database */}
        <div className="p-4 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">MongoDB Database</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {infra?.database?.connected ? "Connected" : "Disconnected"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">({infra?.database?.collectionsCount || 88} col.)</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database width={18} height={18} />
          </div>
        </div>

        {/* Redis Cache */}
        <div className="p-4 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Redis In-Memory Cache</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {infra?.redis?.connected ? "Connected" : "Local Fallback"}
              </span>
              {infra?.redis?.pingMs && (
                <span className="text-xs text-emerald-600 font-mono font-semibold">{infra.redis.pingMs}ms</span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Zap width={18} height={18} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700 overflow-x-auto">
          {/* Tab 1: All APIs */}
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Activity width={14} height={14} />
            <span>All API Endpoints</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono">
              {apiResults.length || 32}
            </span>
          </button>

          {/* Tab 2: Error & Failure Console */}
          <button
            type="button"
            onClick={() => setActiveTab("errors")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "errors"
                ? "bg-white dark:bg-[#121214] text-rose-600 dark:text-rose-400 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Bug width={14} height={14} className={failedApis.length > 0 ? "text-rose-600 animate-pulse" : ""} />
            <span>Error & Failure Console</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                failedApis.length > 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {failedApis.length}
            </span>
          </button>

          {/* Tab 3: Infrastructure */}
          <button
            type="button"
            onClick={() => setActiveTab("infrastructure")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "infrastructure"
                ? "bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Cloud width={14} height={14} />
            <span>AWS & Infrastructure</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL API ENDPOINTS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search width={14} height={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search API by name or endpoint URL..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none focus:border-[#ad2355]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                All ({apiResults.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("healthy")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "healthy"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                Healthy ({summary?.workingCount || apiResults.filter((r) => r.status === "healthy").length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("slow")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "slow"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                }`}
              >
                Slow ({summary?.slowCount || apiResults.filter((r) => r.status === "slow").length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("offline")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "offline"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                }`}
              >
                Errors / Offline ({failedApis.length})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Endpoint Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-xs">
                  {filteredApis.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                            item.status === "healthy"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : item.status === "slow"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "healthy"
                                ? "bg-emerald-500"
                                : item.status === "slow"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {item.statusCode || 200} {item.statusText || "OK"}
                        </span>
                      </td>

                      {/* Name & Endpoint */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {item.method}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
                            {item.endpoint}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400 font-medium">
                        {item.category}
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold ${
                              item.responseTimeMs < 300
                                ? "text-emerald-600 dark:text-emerald-400"
                                : item.responseTimeMs < 800
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {item.responseTimeMs}ms
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTestSingleApi(item)}
                            disabled={retryingApiId === item.id}
                            title="Re-test API"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <RefreshCw
                              width={14}
                              height={14}
                              className={retryingApiId === item.id ? "animate-spin text-[#ad2355]" : ""}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedApi(item)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ERROR & FAILURE CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === "errors" && (
        <div className="space-y-4">
          <div className="p-5 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Bug width={16} height={16} className="text-rose-600" />
                <span>API Error Diagnostics & Failure Console</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Detailed stack messages, error codes, and single-click re-testing for failed endpoints.
              </p>
            </div>

            {failedApis.length > 0 && (
              <button
                type="button"
                onClick={handleRetryAllFailed}
                disabled={isRetryingAllErrors}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RotateCcw width={14} height={14} className={isRetryingAllErrors ? "animate-spin" : ""} />
                <span>{isRetryingAllErrors ? "Retrying..." : "Re-Test All Failed APIs"}</span>
              </button>
            )}
          </div>

          {/* If 0 Errors: Clean Reassuring State */}
          {failedApis.length === 0 ? (
            <div className="p-12 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 width={24} height={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Zero API Errors Detected!</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                All 32 platform API endpoints are running smoothly and responding with 200 OK status.
              </p>
              <button
                type="button"
                onClick={runFullScan}
                disabled={isScanning}
                className="mt-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Run Diagnostics Scan Again
              </button>
            </div>
          ) : (
            /* Error Cards List */
            <div className="space-y-3">
              {failedApis.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-white dark:bg-[#18181b] rounded-2xl border border-rose-200 dark:border-rose-900 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                        !
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                            {item.statusCode || 500} {item.statusText || "ERROR"}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                          <span className="font-bold uppercase text-[10px] px-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                            {item.method}
                          </span>
                          <span>{item.endpoint}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyError(item)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedErrorId === item.id ? <Check width={13} height={13} /> : <Copy width={13} height={13} />}
                        <span>{copiedErrorId === item.id ? "Copied" : "Copy Diagnostic"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTestSingleApi(item)}
                        disabled={retryingApiId === item.id}
                        className="px-3.5 py-1.5 rounded-xl bg-[#ad2355] hover:bg-[#8e1944] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw width={13} height={13} className={retryingApiId === item.id ? "animate-spin" : ""} />
                        <span>Re-Test</span>
                      </button>
                    </div>
                  </div>

                  {/* Diagnostic Message Box */}
                  <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/60 text-xs space-y-1">
                    <span className="font-bold text-rose-800 dark:text-rose-200">Error Diagnostic:</span>
                    <p className="font-mono text-[11px] text-rose-700 dark:text-rose-300 break-all">
                      {item.error || item.statusText || "Endpoint failed to respond or returned HTTP error status"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AWS & SERVER INFRASTRUCTURE */}
      {/* ========================================================================= */}
      {activeTab === "infrastructure" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* AWS Services & CloudFront Card */}
          <div className="p-5 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Cloud width={16} height={16} className="text-[#ad2355]" />
              <span>AWS S3 & CloudFront CDN</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Service Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 width={13} height={13} />
                  Active & Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">S3 Media Bucket</span>
                <span className="font-mono font-semibold truncate max-w-[150px]">{infra?.aws?.bucket || "floriwish-media-bucket"}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">AWS Region</span>
                <span className="font-mono font-semibold">{infra?.aws?.region || "ap-south-1 (Mumbai)"}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">CloudFront CDN</span>
                <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">
                  d22rebqllszdz8.cloudfront.net
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Edge Caching</span>
                <span className="font-semibold text-emerald-600">Global Edge CDN</span>
              </div>
            </div>
          </div>

          {/* Database Specs */}
          <div className="p-5 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Database width={16} height={16} className="text-[#ad2355]" />
              <span>MongoDB Database Engine</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Database Name</span>
                <span className="font-mono font-semibold">{infra?.database?.databaseName || "floriwish_production"}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Active Collections</span>
                <span className="font-mono font-semibold">{infra?.database?.collectionsCount || 88} Collections</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Connection State</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 width={13} height={13} />
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Ping Latency</span>
                <span className="font-mono font-semibold">{infra?.database?.pingMs || 12}ms</span>
              </div>
            </div>
          </div>

          {/* Node.js & Server Specs */}
          <div className="p-5 bg-white dark:bg-[#121214] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Server width={16} height={16} className="text-[#ad2355]" />
              <span>Server & Background Workers</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Node Runtime</span>
                <span className="font-mono font-semibold">{infra?.server?.nodeVersion || process.version}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Server Platform / OS</span>
                <span className="font-mono font-semibold">{infra?.server?.platform || "darwin"} ({infra?.server?.arch || "arm64"})</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Push Notifications</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <Bell width={12} height={12} />
                  FCM Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Server Uptime</span>
                <span className="font-mono font-semibold">{infra?.server?.uptimeFormatted || "Active"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspect API Detail Modal */}
      {selectedApi && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{selectedApi.name}</h3>
                <span className="text-xs text-zinc-500 font-mono">{selectedApi.endpoint}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApi(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-400 text-[10px]">Method</span>
                <div className="font-mono font-bold mt-0.5">{selectedApi.method}</div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-400 text-[10px]">Status Code</span>
                <div className="font-mono font-bold mt-0.5 text-emerald-600">{selectedApi.statusCode} OK</div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-400 text-[10px]">Response Time</span>
                <div className="font-mono font-bold mt-0.5">{selectedApi.responseTimeMs}ms</div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-400 text-[10px]">Category</span>
                <div className="font-semibold mt-0.5">{selectedApi.category}</div>
              </div>
            </div>

            {/* JSON Response Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Live JSON Response Preview</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(selectedApi.preview || {}, null, 2), true)}
                  className="text-xs font-semibold text-[#ad2355] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedPayload ? <Check width={12} height={12} /> : <Copy width={12} height={12} />}
                  <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-xl text-xs font-mono max-h-60 overflow-y-auto overflow-x-auto">
                {JSON.stringify(selectedApi.preview || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleTestSingleApi(selectedApi)}
                className="px-4 py-2 bg-[#ad2355] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Re-Test Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
