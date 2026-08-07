"use client";

import { useEffect } from 'react';
import { initializeCacheCleaning } from '@/utils/clearBrowserCache';

export default function CacheInitializer() {
    useEffect(() => {
        // Initialize cache cleaning on app start
        initializeCacheCleaning();

        // Removed storage event listener that was causing infinite refresh loop
        // when multiple tabs were open. The storage event fires across tabs
        // and was triggering page reloads, creating a refresh cycle.
    }, []);

    return null; // This component doesn't render anything
}
