import { useCallback, useRef, useMemo } from 'react';

interface ProductCache {
    [key: string]: any;
}

interface RequestQueue {
    [key: string]: Promise<any>;
}

export function useProductOptimization() {
    const productCache = useRef<ProductCache>({});
    const requestQueue = useRef<RequestQueue>({});
    const lastRequestTime = useRef<{ [key: string]: number }>({});

    // Cache management
    const getCachedProduct = useCallback((productId: string) => {
        return productCache.current[productId];
    }, []);

    const setCachedProduct = useCallback((productId: string, data: any) => {
        productCache.current[productId] = {
            data,
            timestamp: Date.now(),
            expires: Date.now() + (5 * 60 * 1000) // 5 minutes cache
        };
    }, []);

    const isCacheValid = useCallback((productId: string) => {
        const cached = productCache.current[productId];
        return cached && cached.expires > Date.now();
    }, []);

    // Request deduplication
    const deduplicateRequest = useCallback(async <T>(
        key: string,
        requestFn: () => Promise<T>
    ): Promise<T> => {
        // If request is already in progress, return the existing promise
        if (requestQueue.current[key] !== undefined) {
            return requestQueue.current[key];
        }

        // Create new request
        const promise = requestFn().finally(() => {
            delete requestQueue.current[key];
        });

        requestQueue.current[key] = promise;
        return promise;
    }, []);

    // Throttle requests to prevent spam
    const throttleRequest = useCallback((key: string, delay: number = 500): boolean => {
        const now = Date.now();
        const lastTime = lastRequestTime.current[key] || 0;

        if (now - lastTime < delay) {
            return false; // Request is throttled
        }

        lastRequestTime.current[key] = now;
        return true; // Request is allowed
    }, []);

    // Optimized product fetch
    const fetchProductOptimized = useCallback(async (
        productId: string,
        fetchFn: () => Promise<any>
    ) => {
        // Check cache first
        if (isCacheValid(productId)) {
            return getCachedProduct(productId).data;
        }

        // Throttle requests
        if (!throttleRequest(`product-${productId}`)) {
            // If throttled, return cached data if available
            const cached = getCachedProduct(productId);
            if (cached) return cached.data;

            // Otherwise wait a bit and try again
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Deduplicate requests
        return deduplicateRequest(`product-${productId}`, async () => {
            try {
                const data = await fetchFn();
                setCachedProduct(productId, data);
                return data;
            } catch (error) {
                throw error;
            }
        });
    }, [isCacheValid, getCachedProduct, throttleRequest, deduplicateRequest, setCachedProduct]);

    // Preload products for better UX
    const preloadProducts = useCallback((productIds: string[], fetchFn: (id: string) => Promise<any>) => {
        productIds.forEach(id => {
            if (!isCacheValid(id)) {
                // Preload in background without blocking UI
                setTimeout(() => {
                    fetchProductOptimized(id, () => fetchFn(id)).catch(() => {
                        // Silently fail for preloading
                    });
                }, Math.random() * 1000); // Stagger requests
            }
        });
    }, [isCacheValid, fetchProductOptimized]);

    // Clear expired cache entries
    const clearExpiredCache = useCallback(() => {
        const now = Date.now();
        Object.keys(productCache.current).forEach(key => {
            const cached = productCache.current[key];
            if (cached && cached.expires <= now) {
                delete productCache.current[key];
            }
        });
    }, []);

    // Performance metrics
    const getPerformanceMetrics = useCallback(() => {
        return {
            cacheSize: Object.keys(productCache.current).length,
            activeRequests: Object.keys(requestQueue.current).length,
            cacheHitRate: 0 // Could be implemented with counters
        };
    }, []);

    return {
        fetchProductOptimized,
        preloadProducts,
        clearExpiredCache,
        getPerformanceMetrics,
        getCachedProduct,
        isCacheValid
    };
}