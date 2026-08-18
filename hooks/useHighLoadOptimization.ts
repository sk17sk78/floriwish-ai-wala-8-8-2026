import { useCallback, useRef, useEffect } from 'react';

interface LoadBalancer {
    requestCount: number;
    lastReset: number;
    queued: Array<{ fn: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void; priority: number }>;
    processing: boolean;
}

export function useHighLoadOptimization() {
    const loadBalancer = useRef<LoadBalancer>({
        requestCount: 0,
        lastReset: Date.now(),
        queued: [],
        processing: false
    });

    const rateLimiter = useRef<Map<string, number[]>>(new Map());
    const circuitBreaker = useRef<Map<string, {
        failures: number;
        lastFailure: number;
        state: 'closed' | 'open' | 'half-open';
    }>>(new Map());

    // processQueue must be declared BEFORE queueRequest (which calls it)
    const processQueue = useCallback(() => {
        if (loadBalancer.current.processing || loadBalancer.current.queued.length === 0) {
            return;
        }

        loadBalancer.current.processing = true;

        const processNext = () => {
            if (loadBalancer.current.queued.length === 0) {
                loadBalancer.current.processing = false;
                return;
            }

            // Sort by priority
            loadBalancer.current.queued.sort((a, b) => b.priority - a.priority);
            const next = loadBalancer.current.queued.shift();

            if (next) {
                next.fn().then(next.resolve).catch(next.reject);
                setTimeout(processNext, 100); // Controlled processing rate
            }
        };

        processNext();
    }, []);

    // Smart request queuing with priority
    const queueRequest = useCallback(async <T>(
        requestFn: () => Promise<T>,
        options: {
            priority?: 'high' | 'medium' | 'low';
            timeout?: number;
            retries?: number;
        } = {}
    ): Promise<T> => {
        const { priority = 'medium', timeout = 30000, retries = 2 } = options;

        return new Promise((resolve, reject) => {
            const executeWithRetry = async (attemptsLeft: number) => {
                try {
                    const timeoutPromise = new Promise((_, timeoutReject) => {
                        setTimeout(() => timeoutReject(new Error('Request timeout')), timeout);
                    });

                    const result = await Promise.race([requestFn(), timeoutPromise]);
                    loadBalancer.current.requestCount++;
                    resolve(result as T);
                } catch (error) {
                    if (attemptsLeft > 0) {
                        setTimeout(() => executeWithRetry(attemptsLeft - 1), 1000);
                    } else {
                        reject(error);
                    }
                }
            };

            // High priority or low load - execute immediately
            if (priority === 'high' || loadBalancer.current.requestCount < 20) {
                executeWithRetry(retries);
                return;
            }

            // Queue with priority
            const priorityValue = priority === 'medium' ? 1 : 0;
            loadBalancer.current.queued.push({
                fn: () => executeWithRetry(retries),
                resolve,
                reject,
                priority: priorityValue
            });

            processQueue();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processQueue]);

    // Rate limiting per user/session
    const isRateLimited = useCallback((
        key: string,
        maxRequests: number = 100,
        windowMs: number = 60000
    ): boolean => {
        const now = Date.now();
        const windowStart = now - windowMs;

        let requests = rateLimiter.current.get(key) || [];
        requests = requests.filter(timestamp => timestamp > windowStart);

        if (requests.length >= maxRequests) {
            return true; // Rate limited
        }

        requests.push(now);
        rateLimiter.current.set(key, requests);
        return false;
    }, []);

    // Circuit breaker for failing services
    const executeWithCircuitBreaker = useCallback(async <T>(
        serviceKey: string,
        requestFn: () => Promise<T>,
        options: {
            failureThreshold?: number;
            recoveryTimeout?: number;
        } = {}
    ): Promise<T> => {
        const { failureThreshold = 5, recoveryTimeout = 30000 } = options;

        let circuit = circuitBreaker.current.get(serviceKey);
        if (!circuit) {
            circuit = { failures: 0, lastFailure: 0, state: 'closed' };
            circuitBreaker.current.set(serviceKey, circuit);
        }

        const now = Date.now();

        // Check circuit state
        if (circuit.state === 'open') {
            if (now - circuit.lastFailure > recoveryTimeout) {
                circuit.state = 'half-open';
            } else {
                throw new Error(`Service ${serviceKey} is temporarily unavailable`);
            }
        }

        try {
            const result = await requestFn();

            // Reset on success
            if (circuit.state === 'half-open') {
                circuit.state = 'closed';
                circuit.failures = 0;
            }

            return result;
        } catch (error) {
            circuit.failures++;
            circuit.lastFailure = now;

            if (circuit.failures >= failureThreshold) {
                circuit.state = 'open';
            }

            throw error;
        }
    }, []);

    // Memory optimization
    const optimizeMemory = useCallback(() => {
        const now = Date.now();
        const oneHourAgo = now - 3600000;

        // Clean rate limiter
        Array.from(rateLimiter.current.entries()).forEach(([key, timestamps]) => {
            const filtered = timestamps.filter(t => t > oneHourAgo);
            if (filtered.length === 0) {
                rateLimiter.current.delete(key);
            } else {
                rateLimiter.current.set(key, filtered);
            }
        });

        // Reset request counter
        if (now - loadBalancer.current.lastReset > 60000) {
            loadBalancer.current.requestCount = Math.max(0, loadBalancer.current.requestCount - 50);
            loadBalancer.current.lastReset = now;
        }
    }, []);

    // Auto cleanup
    useEffect(() => {
        const interval = setInterval(optimizeMemory, 300000); // Every 5 minutes
        return () => clearInterval(interval);
    }, [optimizeMemory]);

    return {
        queueRequest,
        isRateLimited,
        executeWithCircuitBreaker,
        optimizeMemory,
        getLoadMetrics: () => ({
            requestCount: loadBalancer.current.requestCount,
            queuedRequests: loadBalancer.current.queued.length,
            rateLimitedKeys: rateLimiter.current.size,
            circuitBreakerServices: circuitBreaker.current.size
        })
    };
}