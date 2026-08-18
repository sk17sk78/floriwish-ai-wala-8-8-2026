import { Model, Types } from "mongoose";

export interface NotificationTokenDocument {
  _id: Types.ObjectId;
  userId?: Types.ObjectId | null;
  token: string;
  /** Structured device category: mobile | desktop | tablet */
  deviceType: "mobile" | "desktop" | "tablet";
  /** Browser name: Chrome, Firefox, Safari, Edge, Opera, etc. */
  browser: string;
  /** Operating system: Android, iOS, Windows, macOS, Linux, etc. */
  os: string;
  /** OS version string e.g. "15.6" */
  osVersion: string;
  /** Legacy free-text device info string — kept for backward compat */
  deviceInfo: string;
  /** Raw user-agent string */
  userAgent: string;
  /** Platform tag: web | android | ios | pwa-ios */
  platform: string;
  /** Whether subscription is currently active */
  isActive: boolean;
  /** Timestamp when the user first subscribed */
  subscribedAt: Date;
  /** When the last notification was sent to this token */
  lastSentAt?: Date | null;
  /** Last FCM error code or message, if any */
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationTokenModel = Model<NotificationTokenDocument>;
