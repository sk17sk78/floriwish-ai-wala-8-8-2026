import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseClientConfig.apiKey &&
    firebaseClientConfig.projectId &&
    firebaseClientConfig.messagingSenderId &&
    firebaseClientConfig.appId
  );
};

export const getFirebaseClientApp = (): FirebaseApp | null => {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);
  }
  return app;
};

export const getFirebaseMessagingClient = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  const clientApp = getFirebaseClientApp();
  if (!clientApp) return null;

  if (!messaging) {
    try {
      messaging = getMessaging(clientApp);
    } catch (err) {
      console.warn("FCM Messaging initialization notice:", err);
      return null;
    }
  }
  return messaging;
};

/**
 * Detect platform for token registration payload
 */
export const detectPlatform = (): string => {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isPWA =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  if (isIOS && isPWA) return "pwa-ios";
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "web";
};

/**
 * Register Service Worker and retrieve FCM Web Push Registration Token.
 *
 * CRITICAL FIX: We now await `swRegistration.ready` (not just the register() promise)
 * before calling getToken(). On mobile Chrome, the SW may be in "installing" state
 * right after register() returns — getToken() requires SW to be fully "activated".
 * Awaiting `.ready` ensures the SW is active before FCM tries to use it.
 */
export const requestFCMToken = async (): Promise<{ token: string | null; error?: string }> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { token: null, error: "Notifications not supported in this environment" };
    }

    if (Notification.permission !== "granted") {
      return { token: null, error: "Notification permission not granted" };
    }

    if (!("serviceWorker" in navigator)) {
      return { token: null, error: "Service Worker not supported in this browser" };
    }

    const messagingInstance = await getFirebaseMessagingClient();
    if (!messagingInstance) {
      return { token: null, error: "Firebase Messaging could not be initialized" };
    }

    // Step 1: Register the service worker
    let swRegistration: ServiceWorkerRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
      });
    } catch (swErr: any) {
      console.error("[FCM SW] Registration failed:", swErr);
      return { token: null, error: `Service Worker registration failed: ${swErr.message}` };
    }

    // ─── CRITICAL MOBILE FIX ──────────────────────────────────────────────
    // await .ready ensures the SW transitions from "installing" → "activated"
    // before we call getToken(). Without this, mobile Chrome returns null or
    // throws because the SW is not yet controlling the page.
    // ─────────────────────────────────────────────────────────────────────
    try {
      await navigator.serviceWorker.ready;
    } catch (readyErr) {
      console.warn("[FCM SW] SW ready wait error:", readyErr);
      // Non-fatal — continue with the registered SW
    }

    // Step 2: Get FCM token with the activated SW registration
    try {
      const token = await getToken(messagingInstance, {
        vapidKey: FIREBASE_VAPID_KEY || undefined,
        serviceWorkerRegistration: swRegistration
      });

      if (!token) {
        return { token: null, error: "FCM returned an empty token — check VAPID key and Firebase project settings" };
      }

      return { token };
    } catch (tokenErr: any) {
      // Log the specific FCM error code for easier debugging
      const code = tokenErr?.code || "unknown";
      console.error(`[FCM getToken] Error (code: ${code}):`, tokenErr);

      let message = tokenErr.message || "Failed to get FCM token";
      if (code === "messaging/permission-blocked") {
        message = "Notification permission is blocked in browser settings";
      } else if (code === "messaging/failed-service-worker-registration") {
        message = "Service Worker registration failed";
      } else if (code === "messaging/token-unsubscribe-failed") {
        message = "Failed to unsubscribe from previous token";
      }

      return { token: null, error: message };
    }
  } catch (error: any) {
    console.error("[FCM] Unexpected error:", error);
    return { token: null, error: error.message || "Unexpected error getting FCM token" };
  }
};

/**
 * Listen to foreground FCM messages (when the app is open in browser)
 */
export const listenToForegroundMessages = async (
  callback: (payload: MessagePayload) => void
): Promise<(() => void) | null> => {
  try {
    const messagingInstance = await getFirebaseMessagingClient();
    if (!messagingInstance) return null;

    return onMessage(messagingInstance, (payload) => {
      callback(payload);
    });
  } catch (error) {
    console.warn("Error setting up foreground message listener:", error);
    return null;
  }
};
