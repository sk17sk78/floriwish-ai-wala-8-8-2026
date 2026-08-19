"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { X, Share, PlusSquare, CheckCircle2 } from "lucide-react";

// Official Google Play Triangle Logo (Pixel-Perfect HD Vector)
const GooglePlayIcon = () => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512" fill="none">
    <path
      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
      fill="#00E676"
    />
    <path
      d="M47 40.5c0-10.7 4.2-20.4 11.2-27.5l257.4 257.4-50.3 50.3L47 40.5z"
      fill="#00B0FF"
    />
    <path
      d="M104.6 499l220.7-221.3 60.1 60.1L104.6 499z"
      fill="#FFD600"
    />
    <path
      d="M385.4 337.8L104.6 499c7.1 4.1 15.3 6.5 24 6.5 8.7 0 17-2.4 24-6.5l297.2-170.8-64.4-60.4z"
      fill="#FF3D00"
    />
    <path
      d="M449.8 234.3L152.6 63.5c-7.1-4.1-15.3-6.5-24-6.5-8.7 0-17 2.4-24 6.5L385.4 224.2l64.4 10.1z"
      fill="#00B0FF"
    />
  </svg>
);

// Official Apple Silhouette Logo (Pixel-Perfect HD Vector)
const AppleIcon = () => (
  <svg className="w-6 h-6 shrink-0 fill-white" viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

// High-Definition Modern Desktop / Laptop Vector
const LaptopIcon = () => (
  <svg className="w-6 h-6 shrink-0 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M2 20h20" />
  </svg>
);

function FooterAppInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<"ios" | "android" | "desktop" | "success" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setActiveModal("success");
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleAndroidClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } catch (e) {
        setActiveModal("android");
      }
    } else {
      setActiveModal("android");
    }
  }, [deferredPrompt]);

  const handleIosClick = useCallback(() => {
    setActiveModal("ios");
  }, []);

  const handleDesktopClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
        }
      } catch (e) {
        setActiveModal("desktop");
      }
    } else {
      setActiveModal("desktop");
    }
  }, [deferredPrompt]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Title */}
        <div className="text-center md:text-left">
          <p className="text-[15px] font-semibold text-white tracking-tight">
            Download App
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Get the full app experience on any device
          </p>
        </div>

        {/* Official Pixel-Perfect Store Badges */}
        <div className="flex items-center justify-center flex-wrap gap-3">
          {/* 1. Google Play Badge */}
          <button
            type="button"
            onClick={handleAndroidClick}
            aria-label="Get it on Google Play"
            className="group flex items-center gap-3 h-[46px] px-3.5 bg-black hover:bg-zinc-900 active:scale-95 text-white rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <GooglePlayIcon />
            <div className="flex flex-col text-left justify-center">
              <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-400 leading-none">
                GET IT ON
              </span>
              <span className="text-[13px] font-bold text-white tracking-tight leading-none mt-1 group-hover:text-emerald-400 transition-colors">
                Google Play
              </span>
            </div>
          </button>

          {/* 2. Apple App Store Badge */}
          <button
            type="button"
            onClick={handleIosClick}
            aria-label="Download on the App Store"
            className="group flex items-center gap-3 h-[46px] px-3.5 bg-black hover:bg-zinc-900 active:scale-95 text-white rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <AppleIcon />
            <div className="flex flex-col text-left justify-center">
              <span className="text-[9px] font-medium tracking-wide text-zinc-400 leading-none">
                Download on the
              </span>
              <span className="text-[13px] font-bold text-white tracking-tight leading-none mt-1 group-hover:text-sky-300 transition-colors">
                App Store
              </span>
            </div>
          </button>

          {/* 3. Desktop / Laptop Badge */}
          <button
            type="button"
            onClick={handleDesktopClick}
            aria-label="Install Desktop App"
            className="group flex items-center gap-3 h-[46px] px-3.5 bg-black hover:bg-zinc-900 active:scale-95 text-white rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <LaptopIcon />
            <div className="flex flex-col text-left justify-center">
              <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-400 leading-none">
                INSTALL FOR
              </span>
              <span className="text-[13px] font-bold text-white tracking-tight leading-none mt-1 group-hover:text-purple-300 transition-colors">
                Windows & Mac
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Minimalist iOS Modal ── */}
      {activeModal === "ios" && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xs bg-white text-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-700 rounded-full cursor-pointer"
            >
              <X width={16} height={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                <AppleIcon />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Install on iPhone</h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 mb-4">
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">1.</span>
                <span>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-sky-600 ml-0.5" /> in Safari.</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">2.</span>
                <span>Select <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 inline text-zinc-800 ml-0.5" />.</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Minimalist Android Modal ── */}
      {activeModal === "android" && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xs bg-white text-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-700 rounded-full cursor-pointer"
            >
              <X width={16} height={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                <GooglePlayIcon />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Install on Android</h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 mb-4">
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">1.</span>
                <span>Tap Chrome menu <strong>(⋮)</strong> in top-right.</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">2.</span>
                <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Minimalist Desktop Modal ── */}
      {activeModal === "desktop" && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xs bg-white text-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-700 rounded-full cursor-pointer"
            >
              <X width={16} height={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                <LaptopIcon />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Install on Desktop</h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 mb-4">
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">1.</span>
                <span>Click the <strong>Install icon</strong> in your browser address bar.</span>
              </div>
              <div className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="font-bold text-zinc-900">2.</span>
                <span>Click <strong>Install</strong> to add to your desktop applications.</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {activeModal === "success" && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xs bg-white text-zinc-900 rounded-2xl p-5 shadow-xl border border-zinc-200 text-center animate-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-zinc-900 mb-1">App Installed</h3>
            <p className="text-xs text-zinc-500 mb-4">
              You can now launch the app directly from your home screen.
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(FooterAppInstall);
