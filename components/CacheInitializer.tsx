"use client";

import { useEffect } from 'react';
import { initializeCacheCleaning } from '@/utils/clearBrowserCache';

export default function CacheInitializer() {
    useEffect(() => {
        // Initialize cache cleaning on app start after idle
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(initializeCacheCleaning);
        } else {
            setTimeout(initializeCacheCleaning, 2000);
        }
    }, []);

    return null; // This component doesn't render anything
}
