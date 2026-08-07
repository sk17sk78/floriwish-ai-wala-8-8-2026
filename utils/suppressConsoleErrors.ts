// Utility to suppress known harmless console errors in development
export const suppressKnownErrors = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return;
  }

  const originalError = console.error;
  const originalWarn = console.warn;

  // List of known harmless error patterns to suppress
  const suppressPatterns = [
    /Cross-Origin-Opener-Policy policy would block the window\.closed call/,
    /Failed to load resource.*127\.0\.0\.1:7242/,
    /net::ERR_CONNECTION_REFUSED.*127\.0\.0\.1:7242/,
    /The resource.*was preloaded using link preload but not used/,
  ];

  console.error = (...args) => {
    const message = args.join(" ");

    // Check if this error should be suppressed
    const shouldSuppress = suppressPatterns.some((pattern) =>
      pattern.test(message),
    );

    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    const message = args.join(" ");

    // Suppress specific warnings
    const shouldSuppress = suppressPatterns.some((pattern) =>
      pattern.test(message),
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
};

// Initialize on client side
if (typeof window !== "undefined") {
  suppressKnownErrors();
}
