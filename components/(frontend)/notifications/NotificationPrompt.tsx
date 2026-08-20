"use client";

import { useEffect, useCallback, memo } from "react";
import { requestFCMToken, listenToForegroundMessages, detectPlatform } from "@/config/firebase";
import { useOptionalAppStates } from "@/hooks/useAppState/useAppState";

const STORAGE_KEY = "floriwish_push_native_v1";

/**
 * Headless Native Push Notification Manager
 *
 * 100% Official Browser/Device Native Notification Flow:
 * - NO custom/fake popups, modals, or HTML permission dialogs.
 * - Uses browser's official `Notification.requestPermission()`.
 * - Cross-device: Chrome, Safari, Edge, Android, iOS PWA / iPad, Desktop.
 * - Dispatches actual OS/System notifications on incoming messages.
 * - Returns `null` (zero DOM overhead).
 */
function NotificationPrompt() {
  const appStates = useOptionalAppStates();
  const customerId = appStates?.auth?.data?.customerId || null;

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

  // ─── Request Native Browser Permission ───────────────────────────────────────
  const requestNativePermission = useCallback(async () => {
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
        await registerToken(customerId);
        setupForegroundListener();
      } else if (permission === "denied") {
        localStorage.setItem(STORAGE_KEY, "denied");
      }
    } catch (err) {
      console.warn("[FCM] Native permission request notice:", err);
    }
  }, [customerId, registerToken, setupForegroundListener]);

  // ─── Main Lifecycle Effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cleanupFn: (() => void) | undefined;

    const startNotificationFlow = () => {
      // Ensure Service Worker is registered
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js", { scope: "/" })
          .catch(() => {});
      }

      const currentPermission = Notification.permission;

      // 1. Permission already granted → register token & listen
      if (currentPermission === "granted") {
        registerToken(customerId);
        setupForegroundListener();
        return;
      }

      // 2. Permission already denied → do nothing
      if (currentPermission === "denied") {
        return;
      }

      // 3. Permission is default → request native permission
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState === "denied") return;

      // Trigger official browser prompt on first user gesture or after gentle delay
      const handleUserGesture = () => {
        if (Notification.permission === "default") {
          requestNativePermission();
        }
        window.removeEventListener("click", handleUserGesture);
        window.removeEventListener("touchstart", handleUserGesture);
      };

      window.addEventListener("click", handleUserGesture, { once: true });
      window.addEventListener("touchstart", handleUserGesture, { once: true });

      const timer = setTimeout(() => {
        if (Notification.permission === "default") {
          requestNativePermission();
        }
      }, 2500);

      cleanupFn = () => {
        clearTimeout(timer);
        window.removeEventListener("click", handleUserGesture);
        window.removeEventListener("touchstart", handleUserGesture);
      };
    };

    if ("requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(startNotificationFlow, { timeout: 3000 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleId);
        }
        if (cleanupFn) cleanupFn();
      };
    } else {
      const timer = setTimeout(startNotificationFlow, 1500);
      return () => {
        clearTimeout(timer);
        if (cleanupFn) cleanupFn();
      };
    }
  }, [customerId, registerToken, setupForegroundListener, requestNativePermission]);

  // ─── Re-register when customer logs in ───────────────────────────────────────
  useEffect(() => {
    if (!customerId || typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    registerToken(customerId);
  }, [customerId, registerToken]);

  // Pure headless component — 100% native browser UI, zero DOM footprint
  return null;
}

export default memo(NotificationPrompt);
