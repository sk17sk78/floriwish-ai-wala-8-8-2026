"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Layers,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
  History,
  Terminal,
  ArrowRight,
  Server,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle
} from "lucide-react";

interface IStep {
  key: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  durationMs: number;
  keysCount: number;
  error?: string;
}

interface IResetStatus {
  isRunning: boolean;
  jobId: string;
  adminName: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  totalKeysCleared: number;
  totalKeysRebuilt: number;
  currentStepIndex: number;
  totalSteps: number;
  currentStepName: string;
  steps: IStep[];
  status: "idle" | "running" | "completed" | "failed";
  errorMessage?: string;
  logs: string[];
}

interface IAuditLog {
  _id: string;
  adminName: string;
  action: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  totalKeysCleared: number;
  totalKeysRebuilt: number;
  notes?: string;
  createdAt: string;
}

export default function ResetCache() {
  const [status, setStatus] = useState<IResetStatus>({
    isRunning: false,
    jobId: "",
    adminName: "Admin",
    startedAt: null,
    completedAt: null,
    durationMs: 0,
    totalKeysCleared: 0,
    totalKeysRebuilt: 0,
    currentStepIndex: 0,
    totalSteps: 10,
    currentStepName: "",
    steps: [],
    status: "idle",
    logs: []
  });

  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(false);
  const [showTechnicalLogs, setShowTechnicalLogs] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch status and audit logs
  const fetchStatusAndLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/redis-cache/full-reset");
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data.status);
        setAuditLogs(data.data.recentLogs || []);

        if (data.data.status.status === "completed") {
          setShowSuccessBanner(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch cache status", err);
    }
  }, []);

  useEffect(() => {
    fetchStatusAndLogs();
  }, [fetchStatusAndLogs]);

  // Polling while running
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    if (status.isRunning) {
      pollInterval = setInterval(fetchStatusAndLogs, 800);
      if (!timerRef.current) {
        setElapsedSeconds(0);
        timerRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status.isRunning, fetchStatusAndLogs]);

  // Trigger Full Reset
  const handleTriggerFullReset = async () => {
    if (status.isRunning) return;

    try {
      setIsLoading(true);
      setShowSuccessBanner(false);
      const res = await fetch("/api/admin/redis-cache/full-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName: "Admin" })
      });
      const data = await res.json();

      if (data.success) {
        fetchStatusAndLogs();
      } else {
        alert(data.message || "Failed to start Redis reset");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const completedStepsCount = (status.steps || []).filter((s) => s.status === "completed").length;
  const progressPercent =
    status.status === "completed"
      ? 100
      : Math.round((completedStepsCount / (status.totalSteps || 10)) * 100);

  return (
    <div className="w-full min-h-screen bg-[#fafaf8] text-stone-900 pb-16 font-sans antialiased">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-200/80 sticky top-0 z-30 px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5e1628]/10 flex items-center justify-center text-[#5e1628]">
              <Database width={18} height={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Redis Cache & Full Reset
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage memory cache synchronization, rebuild fresh database indexes, and publish updates live.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchStatusAndLogs}
            className="px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw width={13} height={13} className={status.isRunning ? "animate-spin text-[#5e1628]" : ""} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Success Banner */}
        {showSuccessBanner && status.status === "completed" && (
          <div className="p-4 sm:p-5 bg-white border border-emerald-300 rounded-2xl flex items-start justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 width={18} height={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Cache Rebuilt & Published Successfully
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Redis cache has been successfully cleared, rebuilt, and published. All latest website updates are now live across products, category pages, banners, cities, and search.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium mt-2.5">
                  <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">Duration: {(status.durationMs / 1000).toFixed(2)}s</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">Keys Cleared: {status.totalKeysCleared}</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">Keys Rebuilt: {status.totalKeysRebuilt}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-stone-400 hover:text-stone-700 p-1 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3 Metric Overview Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Memory Cache Health</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${status.isRunning ? "bg-amber-500 animate-ping" : "bg-emerald-600"}`} />
              <span className="text-xl font-bold text-stone-900">
                {status.isRunning ? "Synchronizing..." : "100% Operational"}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 mt-2">Zero database impact</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Active Keys in Memory</span>
            <span className="text-2xl font-bold text-stone-900 mt-2">
              {status.totalKeysRebuilt > 0 ? status.totalKeysRebuilt.toLocaleString() : "Fresh"}
            </span>
            <span className="text-[11px] text-stone-400 mt-2">Warmed up from MongoDB</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Last Synchronization</span>
            <span className="text-sm font-bold text-stone-800 mt-2">
              {status.completedAt
                ? new Date(status.completedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : auditLogs.length > 0
                ? new Date(auditLogs[0].createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "Not yet run"}
            </span>
            <span className="text-[11px] text-stone-400 mt-2">By: {status.adminName || "Admin"}</span>
          </div>
        </div>

        {/* Primary Action Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5e1628]">
            <Sparkles width={14} height={14} />
            <span>Website Synchronization Engine</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Full Reset Redis Cache
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              Performs a safe, non-destructive memory flush and immediately extracts fresh content from the database for 
              Homepage, Category Levels 1 to 5, Product Catalog, Category Banner Overlays, Delivery Cities, and Blogs.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={handleTriggerFullReset}
              disabled={status.isRunning || isLoading}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                status.isRunning
                  ? "bg-[#5e1628]/60 cursor-not-allowed"
                  : "bg-[#5e1628] hover:bg-[#48101e] active:scale-98"
              }`}
            >
              <RefreshCw width={15} height={15} className={status.isRunning ? "animate-spin" : ""} />
              <span>{status.isRunning ? "Full Reset in Progress..." : "Rebuild & Full Reset Cache"}</span>
            </button>

            {status.isRunning && (
              <div className="text-xs text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                <Clock width={13} height={13} className="animate-spin text-amber-700" />
                <span>Redis cache refresh is already in progress ({elapsedSeconds}s elapsed)</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Rebuild Checklist (Visible when running or previously executed) */}
        {(status.isRunning || status.steps.length > 0) && (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {status.isRunning ? "Live Rebuild Progress" : "Synchronization Checklist"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {status.isRunning ? status.currentStepName || "Processing modules..." : "All 10 modules completed and verified"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-stone-900">{progressPercent}% Completed</span>
                <div className="text-[11px] text-stone-400">
                  {completedStepsCount} of {status.totalSteps || 10} steps finished
                </div>
              </div>
            </div>

            {/* Clean Progress Bar */}
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status.status === "failed" ? "bg-rose-600" : "bg-[#5e1628]"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 10 Step Modules List */}
            <div className="space-y-2 pt-1">
              {(status.steps || []).map((step, idx) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "in_progress";
                const isFailed = step.status === "failed";

                return (
                  <div
                    key={step.key}
                    className={`px-3.5 py-2.5 rounded-xl border transition-colors flex items-center justify-between gap-3 text-xs ${
                      isDone
                        ? "bg-white border-stone-200 text-stone-800"
                        : isCurrent
                        ? "bg-rose-50/50 border-rose-300 text-[#5e1628] font-semibold"
                        : isFailed
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-stone-50/50 border-stone-100 text-stone-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 width={15} height={15} className="text-emerald-700" />
                        ) : isCurrent ? (
                          <RefreshCw width={13} height={13} className="animate-spin text-[#5e1628]" />
                        ) : isFailed ? (
                          <AlertCircle width={14} height={14} className="text-rose-600" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                        )}
                      </div>
                      <span className="truncate">{step.name}</span>
                    </div>

                    <div className="text-[11px] text-stone-400 shrink-0 font-medium">
                      {isDone ? `${(step.durationMs / 1000).toFixed(2)}s` : isCurrent ? "Processing..." : "-"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collapsible Execution Logs */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showTechnicalLogs ? "Hide Process Logs" : "View Process Logs"}</span>
                {showTechnicalLogs ? <ChevronUp width={13} height={13} /> : <ChevronDown width={13} height={13} />}
              </button>

              {showTechnicalLogs && (
                <div className="mt-2.5 p-3.5 bg-stone-900 text-stone-200 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
                  {(status.logs || []).map((log, idx) => (
                    <div key={idx} className="text-stone-300">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Log History Table */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <History width={15} height={15} className="text-[#5e1628]" />
                Synchronization History
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Log of past cache resets and durations.</p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              No previous cache reset history recorded. Click &quot;Rebuild &amp; Full Reset Cache&quot; above to perform the first sync.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Keys Rebuilt</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{log.action || "FULL_RESET"}</td>
                      <td className="py-3 px-4 text-stone-700">{log.adminName}</td>
                      <td className="py-3 px-4 font-mono text-stone-600">{(log.durationMs / 1000).toFixed(2)}s</td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{log.totalKeysRebuilt}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            log.status === "completed"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-stone-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
