// Utility to clear problematic browser cache and localStorage
export const clearBrowserCache = () => {
    try {
        // Clear localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            // Clear specific cart-related items that might cause issues
            const keysToRemove = [
                'cart',
                'cartItems',
                'checkout',
                'customerDetails',
                'deliveryDetails',
                'cartPrice',
                'cartCoupon'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        }

        // Clear sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.clear();
        }

        // Clear IndexedDB if available
        if (typeof window !== 'undefined' && window.indexedDB) {
            // This is more complex and should be done carefully
        }

        return true;
    } catch (error) {
        return false;
    }
};

// Safe localStorage operations
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            if (typeof window === 'undefined') return null;
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },

    setItem: (key: string, value: string): boolean => {
        try {
            if (typeof window === 'undefined') return false;
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            return false;
        }
    },

    removeItem: (key: string): boolean => {
        try {
            if (typeof window === 'undefined') return false;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Initialize cache clearing on app start if needed
export const initializeCacheCleaning = () => {
    if (typeof window !== 'undefined') {
        // Check if we need to clear cache (e.g., after app update)
        const lastClearTime = safeLocalStorage.getItem('lastCacheClear');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!lastClearTime || (now - parseInt(lastClearTime)) > oneDay) {
            clearBrowserCache();
            safeLocalStorage.setItem('lastCacheClear', now.toString());
        }
    }
};