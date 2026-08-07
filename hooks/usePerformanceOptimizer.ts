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
            }

            if (metrics.renderCount % 100 === 0) {
            }
        }
    }, [componentName]);

    // Debounce function for expensive operations
    const debounce = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        const timeoutRef = useRef<NodeJS.Timeout>();

        return (...args: Parameters<T>) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => func(...args), delay);
        };
    }, []);

    // Throttle function for frequent events
    const throttle = useCallback(<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        const lastCallRef = useRef<number>(0);

        return (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCallRef.current >= delay) {
                lastCallRef.current = now;
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
        endMeasurement
    };
}