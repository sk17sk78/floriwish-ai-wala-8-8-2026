"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { Bell, X, Sparkles, CheckCircle2 } from "lucide-react";
import { requestFCMToken, listenToForegroundMessages, detectPlatform } from "@/config/firebase";
import { useOptionalAppStates } from "@/hooks/useAppState/useAppState";

const STORAGE_KEY = "floriwish_push_prompt_dismissed_v2";

/**
 * Universal Native Push Notification Trigger Component
 *
 * Fully compliant with Chrome, Safari (Mac/iPad/iOS 16.4+), and Android WebKit security standards.
 * Modern browsers strictly require an explicit user click gesture to display the native
 * browser permission popup ("floriwish.com wants to send you notifications").
 */
function NotificationPrompt() {
  const appStates = useOptionalAppStates();
  const customerId = appStates?.auth?.data?.customerId || null;

  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ─── Register FCM Token with Backend ─────────────────────────────────────────
  const registerToken = useCallback(async (userId?: string | null) => {
    try {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const result = await requestFCMToken();
      if (!result?.token) return;

      const platform = detectPlatform();

      await fetch("/api/frontend/notifications/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.token,
          userId: userId || null,
          platform,
          userAgent: navigator.userAgent
        })
      });
    } catch (err) {
      console.warn("[FCM] Token registration notice:", err);
    }
  }, []);

  // ─── Setup Foreground Notification Handler (Native OS Notification) ──────────
  const setupForegroundListener = useCallback(() => {
    listenToForegroundMessages((payload: any) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const notification = payload.notification || {};
      const data = payload.data || {};

      const title = notification.title || data.title || "Floriwish";
      const body = notification.body || data.body || "You have a new update from Floriwish.";
      const imageUrl = notification.image || (notification as any).imageUrl || data.image || data.imageUrl || "";
      const url = data.url || data.click_action || (notification as any).click_action || "/";
      const icon = "/icons/icon-192x192.png";

      try {
        const notifOptions: NotificationOptions = {
          body,
          icon,
          badge: icon,
          data: { url },
          // @ts-ignore
          image: imageUrl || undefined,
          requireInteraction: true,
          tag: data.tag || `floriwish-${Date.now()}`
        };

        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready
            .then((reg) => {
              reg.showNotification(title, notifOptions);
            })
            .catch(() => {
              try {
                new Notification(title, notifOptions);
              } catch {}
            });
        } else {
          new Notification(title, notifOptions);
        }
      } catch (e) {
        console.warn("[FCM] Native notification notice:", e);
      }
    });
  }, []);

  // ─── Synchronous User Gesture Permission Handler ──────────────────────────────
  // Triggered DIRECTLY on user click so Safari/iOS/Chrome will pop up the native dialog
  const handleAllowClick = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    try {
      setIsProcessing(true);

      // 1. Request native permission directly within user click gesture
      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      if (permission === "granted") {
        setIsSuccess(true);
        localStorage.setItem(STORAGE_KEY, "granted");
        await registerToken(customerId);
        setupForegroundListener();

        // Dismiss after showing success state briefly
        setTimeout(() => {
          setShowPrompt(false);
        }, 1800);
      } else {
        localStorage.setItem(STORAGE_KEY, "denied");
        setShowPrompt(false);
      }
    } catch (err) {
      console.warn("[FCM] Permission request error:", err);
      setShowPrompt(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed_" + Date.now());
    setShowPrompt(false);
  };

  // ─── Main Lifecycle Check ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js", { scope: "/" })
        .catch(() => {});
    }

    const currentPermission = Notification.permission;

    // If already granted, register & listen immediately
    if (currentPermission === "granted") {
      registerToken(customerId);
      setupForegroundListener();
      return;
    }

    // If already denied in browser, do not show banner
    if (currentPermission === "denied") {
      return;
    }

    // Check if dismissed recently (within 3 days)
    const dismissedVal = localStorage.getItem(STORAGE_KEY);
    if (dismissedVal && dismissedVal.startsWith("dismissed_")) {
      const timestamp = parseInt(dismissedVal.replace("dismissed_", ""), 10);
      if (!isNaN(timestamp) && Date.now() - timestamp < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Show prompt after 2 seconds on page
    const timer = setTimeout(() => {
      if (Notification.permission === "default") {
        setShowPrompt(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [customerId, registerToken, setupForegroundListener]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99999] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-2xl rounded-2xl p-4.5 sm:p-5 text-zinc-900">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ad2355]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          {/* Bell Icon Badge */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ad2355] to-[#8e1944] text-white flex items-center justify-center shrink-0 shadow-md">
            {isSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-white animate-in zoom-in-50 duration-200" />
            ) : (
              <Bell className="w-5 h-5 text-white animate-bounce" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-zinc-900 tracking-tight">
                {isSuccess ? "Notifications Enabled!" : "Turn On Order Updates"}
              </h4>
              {!isSuccess && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>

            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              {isSuccess
                ? "You will now receive instant delivery status & surprise alerts."
                : "Get live order tracking, delivery notifications, and exclusive offers."}
            </p>

            {/* Action Buttons */}
            {!isSuccess && (
              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={handleAllowClick}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#ad2355] hover:bg-[#8e1944] active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Opening prompt...</span>
                  ) : (
                    <span>Allow Notifications</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-all cursor-pointer"
                >
                  Later
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          {!isSuccess && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close notification prompt"
              className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(NotificationPrompt);
