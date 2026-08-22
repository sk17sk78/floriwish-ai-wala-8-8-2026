"use client";

import { useEffect, useCallback, useRef, memo } from "react";
import { requestFCMToken, listenToForegroundMessages, detectPlatform } from "@/config/firebase";
import { useOptionalAppStates } from "@/hooks/useAppState/useAppState";

const NATIVE_ATTEMPTED_KEY = "floriwish_native_permission_requested";
const REGISTERED_TOKEN_KEY = "floriwish_registered_fcm_token";

/**
 * Headless Native Push Notification Manager
 *
 * Requirements:
 * 1. ZERO custom/fake modal, banner, popup, card, toast, overlay, or dialog UI.
 * 2. Uses pure native device/browser Notification.requestPermission() (Chrome, Safari, Edge, Android, iOS Web Push).
 * 3. Triggers native OS/browser prompt upon natural user interaction (gesture) when permission === 'default'.
 * 4. Automatically subscribes & registers token on 'granted' without re-asking.
 * 5. Respects 'denied' without repeatedly nagging or throwing errors.
 * 6. Supports user login state change to associate FCM token with logged-in customer ID.
 */
function NotificationPrompt() {
  const appStates = useOptionalAppStates();
  const customerId = appStates?.auth?.data?.customerId || null;
  const isRequestingRef = useRef(false);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  // ─── Register FCM Token with Backend ─────────────────────────────────────────
  const registerToken = useCallback(async (userId?: string | null) => {
    try {
      if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        return;
      }
      if (Notification.permission !== "granted") {
        return;
      }

      const result = await requestFCMToken();
      if (!result?.token) return;

      const lastRegistered = sessionStorage.getItem(REGISTERED_TOKEN_KEY);
      const userKey = userId ? `user_${userId}` : "guest";
      const registrationKey = `${result.token}_${userKey}`;

      // Avoid redundant API requests if already registered for this session and user state
      if (lastRegistered === registrationKey) {
        return;
      }

      const platform = detectPlatform();

      const response = await fetch("/api/frontend/notifications/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: result.token,
          userId: userId || null,
          platform,
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        sessionStorage.setItem(REGISTERED_TOKEN_KEY, registrationKey);
      }
    } catch (err) {
      console.warn("[FCM] Token registration notice:", err);
    }
  }, []);

  // ─── Setup Foreground Notification Handler (Native OS Notification) ──────────
  const setupForegroundListener = useCallback(() => {
    if (listenerCleanupRef.current) {
      return; // Already listening
    }

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
    }).then((unsub) => {
      if (unsub) {
        listenerCleanupRef.current = unsub;
      }
    });
  }, []);

  // ─── Request Native Browser Permission On User Gesture ───────────────────────
  const requestNativePermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (typeof Notification.requestPermission !== "function") return;
    if (isRequestingRef.current) return;

    if (Notification.permission !== "default") {
      return;
    }

    try {
      isRequestingRef.current = true;
      sessionStorage.setItem(NATIVE_ATTEMPTED_KEY, "true");

      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      if (permission === "granted") {
        await registerToken(customerId);
        setupForegroundListener();
      }
    } catch (err) {
      console.warn("[FCM] Native permission request notice:", err);
    } finally {
      isRequestingRef.current = false;
    }
  }, [customerId, registerToken, setupForegroundListener]);

  // ─── Main Lifecycle & User Interaction Attacher ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // Register Service Worker in background
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .catch(() => {});

    const currentPermission = Notification.permission;

    // Case 1: Already granted -> immediately register token & setup listener
    if (currentPermission === "granted") {
      registerToken(customerId);
      setupForegroundListener();
      return;
    }

    // Case 2: Already denied -> respect user choice completely, do not ask or nag
    if (currentPermission === "denied") {
      return;
    }

    // Case 3: Permission is "default" (unprompted)
    // Check if we already triggered native prompt in this session
    if (sessionStorage.getItem(NATIVE_ATTEMPTED_KEY) === "true") {
      return;
    }

    // Attach one-time natural user interaction listener to trigger native OS/browser prompt
    const handleFirstUserInteraction = () => {
      // Remove listeners immediately
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchend", handleFirstUserInteraction);
      window.removeEventListener("keydown", handleFirstUserInteraction);

      // Trigger native browser permission request
      requestNativePermission();
    };

    window.addEventListener("click", handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener("touchend", handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener("keydown", handleFirstUserInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchend", handleFirstUserInteraction);
      window.removeEventListener("keydown", handleFirstUserInteraction);
      if (listenerCleanupRef.current) {
        listenerCleanupRef.current();
        listenerCleanupRef.current = null;
      }
    };
  }, [customerId, registerToken, requestNativePermission, setupForegroundListener]);

  // Headless component: NEVER render any custom/fake popup, modal, card or toast UI
  return null;
}

export default memo(NotificationPrompt);
