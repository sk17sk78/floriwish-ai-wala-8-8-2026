/**
 * Performance & Latency Monitoring Utilities
 * Lightweight, production-safe latency tracking and Server-Timing headers.
 */

export interface LatencyBreakdown {
  dbMs?: number;
  cacheMs?: number;
  externalMs?: number;
  processingMs?: number;
  totalMs: number;
}

export type LatencyGrade = "Fast" | "Acceptable" | "Slow" | "Critical";

export function getLatencyGrade(totalMs: number): LatencyGrade {
  if (totalMs < 200) return "Fast";
  if (totalMs < 500) return "Acceptable";
  if (totalMs < 1000) return "Slow";
  return "Critical";
}

/**
 * Creates W3C Server-Timing header string for performance debugging in DevTools Network tab.
 */
export function createServerTimingHeader(breakdown: LatencyBreakdown): string {
  const parts: string[] = [];

  if (typeof breakdown.cacheMs === "number") {
    parts.push(`cache;dur=${breakdown.cacheMs.toFixed(1)};desc="Cache/Redis"`);
  }
  if (typeof breakdown.dbMs === "number") {
    parts.push(`db;dur=${breakdown.dbMs.toFixed(1)};desc="Database"`);
  }
  if (typeof breakdown.externalMs === "number") {
    parts.push(`ext;dur=${breakdown.externalMs.toFixed(1)};desc="External"`);
  }
  if (typeof breakdown.processingMs === "number") {
    parts.push(`app;dur=${breakdown.processingMs.toFixed(1)};desc="Server Processing"`);
  }
  parts.push(`total;dur=${breakdown.totalMs.toFixed(1)};desc="Total Latency"`);

  return parts.join(", ");
}

/**
 * Lightweight latency timer for async operations
 */
export class PerformanceTimer {
  private startTime: number;
  private metrics: Record<string, number> = {};

  constructor() {
    this.startTime = Date.now();
  }

  async measure<T>(label: "db" | "cache" | "external" | "processing", fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      this.metrics[label] = (this.metrics[label] || 0) + duration;
    }
  }

  getBreakdown(): LatencyBreakdown {
    const totalMs = Date.now() - this.startTime;
    return {
      dbMs: this.metrics.db,
      cacheMs: this.metrics.cache,
      externalMs: this.metrics.external,
      processingMs: this.metrics.processing || Math.max(0, totalMs - (this.metrics.db || 0) - (this.metrics.cache || 0) - (this.metrics.external || 0)),
      totalMs
    };
  }

  logIfSlow(route: string, thresholdMs: number = 500): void {
    const totalMs = Date.now() - this.startTime;
    if (process.env.NODE_ENV !== "production" || process.env.DEBUG_LATENCY === "true" || totalMs > thresholdMs) {
      const grade = getLatencyGrade(totalMs);
      const icon = grade === "Fast" ? "⚡" : grade === "Acceptable" ? "⏱️" : grade === "Slow" ? "⚠️" : "🚨";
      console.log(
        `${icon} [LATENCY] ${route} | Total: ${totalMs}ms (${grade}) | DB: ${this.metrics.db || 0}ms | Cache: ${this.metrics.cache || 0}ms`
      );
    }
  }
}
