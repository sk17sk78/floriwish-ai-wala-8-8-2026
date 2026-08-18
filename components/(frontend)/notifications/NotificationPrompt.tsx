"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Bell, X, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { requestFCMToken, listenToForegroundMessages, detectPlatform } from "@/config/firebase";
import { useOptionalAppStates } from "@/hooks/useAppState/useAppState";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "floriwish_push_prompt_v5";

interface ActiveNotification {
  title: string;
  body: string;
  imageUrl?: string;
  url: string;
  timestamp: number;
}

function NotificationPrompt() {
  const [showAllowPrompt, setShowAllowPrompt] = useState(false);
  const [activeNotification, setActiveNotification] = useState<ActiveNotification | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const router = useRouter();

  const appStates = useOptionalAppStates();
  const customerId = appStates?.auth?.data?.customerId || null;

  // ─── Setup Foreground Notification Listener ─────────────────────────────────
  const setupForegroundListener = useCallback(() => {
    listenToForegroundMessages((payload: any) => {
      const notification = payload.notification || {};
      const data = payload.data || {};

      const title = notification.title || data.title || "Floriwish Notification";
      const body = notification.body || data.body || "You have a new update from Floriwish.";
      const imageUrl = notification.image || (notification as any).imageUrl || data.image || data.imageUrl || "";
      const url = data.url || data.click_action || (notification as any).click_action || "/";
      const icon = "/icons/icon-192x192.png";

      // 1. Show CENTER POPUP on the website for Laptop, iPad & Mobile
      setActiveNotification({
        title,
        body,
        imageUrl,
        url,
        timestamp: Date.now()
      });

      // 2. Also trigger native system notification banner
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const notifOptions: any = {
            body,
            icon,
            badge: icon,
            data: { url },
            requireInteraction: true
          };
          if (imageUrl) {
            notifOptions.image = imageUrl;
          }

          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, notifOptions);
            });
          } else {
            new Notification(title, notifOptions);
          }
        } catch (e) {
          console.warn("Desktop notification trigger notice:", e);
        }
      }
    });
  }, []);

  // ─── Register FCM Token with Backend ─────────────────────────────────────────
  const registerToken = useCallback(async (userId?: string | null) => {
    try {
      const result = await requestFCMToken();
      if (!result.token) return;

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
      console.warn("[FCM] Token registration error:", err);
    }
  }, []);

  // ─── Handle Permission Request from User ────────────────────────────────────
  const handleAllowNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setShowAllowPrompt(false);
      return;
    }

    setIsRequestingPermission(true);
    try {
      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      if (permission === "granted") {
        localStorage.setItem(STORAGE_KEY, "granted");
        setShowAllowPrompt(false);
        await registerToken(customerId);
        setupForegroundListener();
      } else if (permission === "denied") {
        localStorage.setItem(STORAGE_KEY, "denied");
        setShowAllowPrompt(false);
      } else {
        localStorage.setItem(STORAGE_KEY, "dismissed");
        setShowAllowPrompt(false);
      }
    } catch (err) {
      console.error("Permission request error:", err);
      setShowAllowPrompt(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleDismissAllow = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setShowAllowPrompt(false);
  };

  const handleNotificationClick = () => {
    if (!activeNotification) return;
    const targetUrl = activeNotification.url;
    setActiveNotification(null);
    if (targetUrl && targetUrl !== "/") {
      router.push(targetUrl);
    }
  };

  const triggerNativePermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    try {
      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      if (permission === "granted") {
        localStorage.setItem(STORAGE_KEY, "granted");
        setShowAllowPrompt(false);
        await registerToken(customerId);
        setupForegroundListener();
      } else if (permission === "denied") {
        localStorage.setItem(STORAGE_KEY, "denied");
        setShowAllowPrompt(false);
      }
    } catch (err) {
      console.warn("Native notification request error:", err);
    }
  }, [customerId, registerToken, setupForegroundListener]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Pre-register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" }).catch(() => {});
    }

    const currentPermission = Notification.permission;

    if (currentPermission === "granted") {
      registerToken(customerId);
      setupForegroundListener();
      return;
    }

    if (currentPermission === "denied") return;

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState === "dismissed" || savedState === "granted" || savedState === "denied") return;

    const ua = navigator.userAgent || "";
    const isMobileOrTablet = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    if (isMobileOrTablet) {
      // 📱 Mobile & iPad: Show custom popup card
      const timer = setTimeout(() => {
        if (Notification.permission === "default") {
          setShowAllowPrompt(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // 💻 Laptop & Desktop: Purely trigger native URL bar prompt (NO bottom popup card)
      const timer = setTimeout(() => {
        if (Notification.permission === "default") {
          triggerNativePermission();
        }
      }, 1000);

      const handleFirstClick = () => {
        if (Notification.permission === "default") {
          triggerNativePermission();
        }
        window.removeEventListener("click", handleFirstClick);
      };
      window.addEventListener("click", handleFirstClick, { once: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener("click", handleFirstClick);
      };
    }
  }, [customerId, registerToken, setupForegroundListener, triggerNativePermission]);

  // Re-register when user logs in
  useEffect(() => {
    if (!customerId || typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    registerToken(customerId);
  }, [customerId, registerToken]);

  return (
    <>
      {/* ─── 1. CENTER POPUP MODAL (When Notification Arrives on Site) ─────── */}
      {activeNotification && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-rose-100 overflow-hidden text-center p-6 sm:p-8 animate-in zoom-in-90 duration-300">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#b76e79] via-[#e28d99] to-[#b76e79]" />

            {/* Close Button */}
            <button
              onClick={() => setActiveNotification(null)}
              aria-label="Close notification"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
            >
              <X width={18} height={18} />
            </button>

            {/* Icon & Brand Header */}
            <div className="flex items-center justify-center gap-2 mb-3 mt-1">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-md ring-4 ring-rose-50/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192x192.png" alt="Floriwish" className="w-9 h-9 rounded-xl object-cover" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-rose-50 border border-rose-200/60 rounded-full text-xs font-bold text-[#b76e79] uppercase tracking-wider mb-3">
              <Sparkles width={13} height={13} className="text-amber-500 animate-spin" />
              <span>Special Update</span>
            </div>

            {/* Notification Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug tracking-tight mb-2 px-1">
              {activeNotification.title}
            </h3>

            {/* Notification Body */}
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-5 px-3">
              {activeNotification.body}
            </p>

            {/* Optional Banner Image */}
            {activeNotification.imageUrl && (
              <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-zinc-100 mb-6 border border-zinc-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeNotification.imageUrl}
                  alt="Notification Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleNotificationClick}
                className="w-full py-3.5 px-6 bg-[#b76e79] hover:bg-[#a25965] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Now</span>
                <ExternalLink width={16} height={16} />
              </button>
              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="w-full sm:w-auto py-3 px-6 text-sm font-semibold text-zinc-500 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. ALLOW PERMISSION POPUP (Only for Mobile & iPad) ─────────────── */}
      {showAllowPrompt && !activeNotification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 lg:hidden">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-rose-100 rounded-3xl p-5 shadow-2xl text-zinc-900 text-center relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={handleDismissAllow}
              aria-label="Dismiss"
              className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X width={16} height={16} />
            </button>

            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#b76e79] shrink-0">
                <Bell width={20} height={20} className="animate-pulse text-[#b76e79]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-zinc-900 flex items-center gap-1">
                  Enable Notifications
                  <Sparkles width={12} height={12} className="text-amber-500 shrink-0" />
                </p>
                <p className="text-[11px] text-zinc-500">Live order updates & deals</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              Allow notifications to get instant alerts for surprise gifts, delivery status, and limited-time discounts.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAllowNotifications}
                disabled={isRequestingPermission}
                className="flex-1 py-2.5 px-4 bg-[#b76e79] hover:bg-[#a25965] text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 width={14} height={14} />
                <span>{isRequestingPermission ? "Enabling..." : "Allow Notifications"}</span>
              </button>
              <button
                type="button"
                onClick={handleDismissAllow}
                className="py-2.5 px-3 text-xs text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(NotificationPrompt);



