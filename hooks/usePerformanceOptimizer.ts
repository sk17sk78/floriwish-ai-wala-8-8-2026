import { useCallback, useRef, useEffect } from 'react';

interface PerformanceMetrics {
    renderCount: number;
    lastRenderTime: number;
    averageRenderTime: number;
    slowRenders: number;
}

export function usePerformanceOptimizer(componentName: string) {
    const metricsRef = useRef<PerformanceMetrics>({
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        slowRenders: 0
    });

    const renderStartTime = useRef<number>(0);

    // Start performance measurement
    const startMeasurement = useCallback(() => {
        renderStartTime.current = performance.now();
    }, []);

    // End performance measurement  
    const endMeasurement = useCallback(() => {
        const renderTime = performance.now() - renderStartTime.current;
        const metrics = metricsRef.current;

        metrics.renderCount++;
        metrics.lastRenderTime = renderTime;
        metrics.averageRenderTime =
            (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

        if (renderTime > 16) { // Slower than 60fps
            metrics.slowRenders++;
        }

        // Log performance warnings in development
        if (process.env.NODE_ENV === 'development') {
            if (renderTime > 50) {
                // slow render - no-op logging intentionally removed
            }

            if (metrics.renderCount % 100 === 0) {
                // periodic metrics - no-op logging intentionally removed
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounce function for expensive operations
    // NOTE: uses plain closure ref instead of useRef (which can't be called in a callback)
    const debounce = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        let timeoutId: NodeJS.Timeout | undefined;

        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }, []);

    // Throttle function for frequent events
    // NOTE: uses plain closure variable instead of useRef (which can't be called in a callback)
    const throttle = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        let lastCall = 0;

        return (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    }, []);

    // Request deduplication
    const requestCache = useRef<Map<string, Promise<any>>>(new Map());

    const deduplicateRequest = useCallback(<T>(
        key: string,
        requestFn: () => Promise<T>
    ): Promise<T> => {
        if (requestCache.current.has(key)) {
            return requestCache.current.get(key)!;
        }

        const promise = requestFn().finally(() => {
            requestCache.current.delete(key);
        });

        requestCache.current.set(key, promise);
        return promise;
    }, []);

    // Measure render performance
    useEffect(() => {
        startMeasurement();
        return () => {
            endMeasurement();
        };
    });

    return {
        metrics: metricsRef.current,
        debounce,
        throttle,
        deduplicateRequest,
        startMeasurement,
        endMeasurement,
        componentName
    };
}