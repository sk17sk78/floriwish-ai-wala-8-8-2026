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
 * Register Service Worker and retrieve FCM Web Push Registration Token
 */
export const requestFCMToken = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return null;
    }

    if (Notification.permission !== "granted") {
      return null;
    }

    const messagingInstance = await getFirebaseMessagingClient();
    if (!messagingInstance) return null;

    // Register / get service worker registration for scope /
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
      });
    }

    const token = await getToken(messagingInstance, {
      vapidKey: FIREBASE_VAPID_KEY || undefined,
      serviceWorkerRegistration: swRegistration
    });

    return token || null;
  } catch (error) {
    console.warn("Error getting FCM Token:", error);
    return null;
  }
};

/**
 * Listen to foreground FCM messages
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
