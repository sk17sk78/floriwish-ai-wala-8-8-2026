"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Clear problematic localStorage if error is related to cart
        if (error.message.includes('Cannot read properties of undefined') ||
            error.message.includes('length') ||
            error.stack?.includes('useCart')) {
            try {
                localStorage.removeItem('cart');
                localStorage.removeItem('cartItems');
                localStorage.removeItem('checkout');
                localStorage.removeItem('deliveryDetails');

                // Reload the page after clearing cache
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (clearError) {
            }
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-4">
                            We&apos;re fixing this issue. The page will reload automatically.
                        </p>
                        <div className="flex space-x-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    window.location.reload();
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Clear Cache & Reload
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
