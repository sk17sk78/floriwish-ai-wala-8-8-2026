import { useCallback, useRef, useMemo } from 'react';

interface ProductCache {
    [key: string]: {
        data: any;
        timestamp: number;
        expires: number;
    };
}

interface RequestQueue {
    [key: string]: Promise<any>;
}

export function useProductPerformance() {
    const productCache = useRef<ProductCache>({});
    const requestQueue = useRef<RequestQueue>({});
    const preloadQueue = useRef<Set<string>>(new Set());

    // Optimized product data fetching with caching
    const fetchProductData = useCallback(async (
        productId: string,
        fetchFn: () => Promise<any>
    ) => {
        // Check cache first
        const cached = productCache.current[productId];
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }

        // Check if request is already in progress
        if (productId in requestQueue.current) {
            return requestQueue.current[productId];
        }

        // Create new request with caching
        const request = fetchFn().then(data => {
            productCache.current[productId] = {
                data,
                timestamp: Date.now(),
                expires: Date.now() + (10 * 60 * 1000) // 10 minutes cache
            };
            return data;
        }).finally(() => {
            delete requestQueue.current[productId];
        });

        requestQueue.current[productId] = request;
        return request;
    }, []);

    // Preload products for instant clicks
    const preloadProduct = useCallback((
        productId: string,
        fetchFn: () => Promise<any>
    ) => {
        if (preloadQueue.current.has(productId)) return;

        preloadQueue.current.add(productId);

        // Preload with low priority
        setTimeout(() => {
            fetchProductData(productId, fetchFn).catch(() => {
                // Silent fail for preloading
            }).finally(() => {
                preloadQueue.current.delete(productId);
            });
        }, 100);
    }, [fetchProductData]);

    // Batch preload multiple products
    const batchPreloadProducts = useCallback((
        productIds: string[],
        fetchFn: (id: string) => Promise<any>
    ) => {
        productIds.forEach((id, index) => {
            setTimeout(() => {
                preloadProduct(id, () => fetchFn(id));
            }, index * 50); // Stagger requests
        });
    }, [preloadProduct]);

    // Optimized image preloading
    const preloadImages = useCallback((imageUrls: string[]) => {
        imageUrls.forEach((url, index) => {
            setTimeout(() => {
                const img = new Image();
                img.src = url;
            }, index * 20); // Stagger image loading
        });
    }, []);

    // Clear expired cache
    const clearExpiredCache = useCallback(() => {
        const now = Date.now();
        Object.keys(productCache.current).forEach(key => {
            if (productCache.current[key].expires <= now) {
                delete productCache.current[key];
            }
        });
    }, []);

    // Performance metrics
    const getMetrics = useCallback(() => {
        return {
            cacheSize: Object.keys(productCache.current).length,
            activeRequests: Object.keys(requestQueue.current).length,
            preloadingCount: preloadQueue.current.size
        };
    }, []);

    return {
        fetchProductData,
        preloadProduct,
        batchPreloadProducts,
        preloadImages,
        clearExpiredCache,
        getMetrics
    };
}