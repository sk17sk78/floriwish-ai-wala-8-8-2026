"use client";

import { useEffect } from 'react';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
        }
       if (entry.entryType === 'first-input') {
  const firstInputEntry = entry as PerformanceEventTiming;
}

        if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
          }
        }
      });
    });

    // Observe performance metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { 
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
    }

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);
};

export const reportWebVitals = (metric: any) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
  }

  // In production, you might want to send to analytics
  // Example: analytics.track('Web Vital', metric);
};