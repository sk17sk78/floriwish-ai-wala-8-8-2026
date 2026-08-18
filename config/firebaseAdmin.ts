import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getMessaging, MulticastMessage, BatchResponse, SendResponse } from "firebase-admin/messaging";
import connectDB from "@/db/mongoose/connection";
import models from "@/db/mongoose/models";

let adminApp: App | null = null;

export const isFirebaseAdminConfigured = (): boolean => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) return true;

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return Boolean(clientEmail && privateKey && projectId);
};

export const getFirebaseAdminApp = (): App | null => {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      return adminApp;
    }

    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (clientEmail && privateKey && projectId) {
      if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        projectId
      });
      return adminApp;
    }

    console.warn("Firebase Admin SDK credentials not provided in environment variables.");
    return null;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
};

export interface SendPushNotificationOptions {
  tokens: string[];
  title: string;
  body: string;
  imageUrl?: string;
  clickUrl?: string;
  data?: Record<string, string>;
}

export interface SendPushNotificationResult {
  totalTargeted: number;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  error?: string;
}

/**
 * Send push notification to multiple device tokens and clean up dead tokens
 */
export const sendPushNotification = async (
  options: SendPushNotificationOptions
): Promise<SendPushNotificationResult> => {
  const { tokens, title, body, imageUrl, clickUrl = "/", data = {} } = options;

  if (!tokens || tokens.length === 0) {
    return {
      totalTargeted: 0,
      successCount: 0,
      failureCount: 0,
      invalidTokens: []
    };
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    return {
      totalTargeted: tokens.length,
      successCount: 0,
      failureCount: tokens.length,
      invalidTokens: [],
      error: "Firebase Admin SDK is not configured in environment variables."
    };
  }

  const messaging = getMessaging(app);

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens: string[] = [];

  // Firebase allows max 500 tokens per multicast batch
  const BATCH_SIZE = 500;
  const batches: string[][] = [];

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    batches.push(tokens.slice(i, i + BATCH_SIZE));
  }

  const websiteUrl = (process.env.NEXT_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_URL || "https://floriwish.com").replace(/\/+$/, "");
  const targetUrl = clickUrl.startsWith("http")
    ? clickUrl
    : `${websiteUrl}${clickUrl.startsWith("/") ? "" : "/"}${clickUrl}`;

  for (const batch of batches) {
    try {
      const messagePayload: MulticastMessage = {
        tokens: batch,
        notification: {
          title,
          body,
          ...(imageUrl ? { imageUrl } : {})
        },
        data: {
          ...data,
          title,
          body,
          url: targetUrl,
          click_action: targetUrl,
          ...(imageUrl ? { image: imageUrl } : {})
        },
        webpush: {
          headers: {
            Urgency: "high"
          },
          notification: {
            title,
            body,
            icon: `${websiteUrl}/icons/icon-192x192.png`,
            badge: `${websiteUrl}/icons/icon-192x192.png`,
            ...(imageUrl ? { image: imageUrl } : {}),
            requireInteraction: true
          },
          fcmOptions: {
            link: targetUrl
          }
        }
      };

      const response: BatchResponse = await messaging.sendEachForMulticast(messagePayload);
      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((resp: SendResponse, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === "messaging/invalid-registration-token" ||
            errCode === "messaging/registration-token-not-registered" ||
            errCode === "messaging/mismatched-credential"
          ) {
            invalidTokens.push(batch[idx]);
          }
        }
      });
    } catch (batchError: any) {
      console.error("Error sending batch notification:", batchError);
      failureCount += batch.length;
    }
  }

  // Auto-cleanup: Deactivate invalid tokens in MongoDB
  if (invalidTokens.length > 0) {
    try {
      await connectDB();
      const { NotificationTokens } = models;
      await NotificationTokens.updateMany(
        { token: { $in: invalidTokens } },
        { $set: { isActive: false } }
      );
      console.log(`[FCM Cleanup] Deactivated ${invalidTokens.length} expired tokens.`);
    } catch (cleanupErr) {
      console.error("Error deactivating invalid FCM tokens:", cleanupErr);
    }
  }

  return {
    totalTargeted: tokens.length,
    successCount,
    failureCount,
    invalidTokens
  };
};
