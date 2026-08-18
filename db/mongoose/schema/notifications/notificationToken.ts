import { Schema } from "mongoose";
import {
  NotificationTokenDocument,
  NotificationTokenModel
} from "@/common/types/documentation/notifications/notificationToken";

export const notificationTokenSchema = new Schema<
  NotificationTokenDocument,
  NotificationTokenModel
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      default: null,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    /** Structured device category */
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet"],
      required: false,
      default: "desktop",
      index: true
    },
    /** Parsed browser name */
    browser: {
      type: String,
      required: false,
      default: ""
    },
    /** Parsed OS name */
    os: {
      type: String,
      required: false,
      default: ""
    },
    /** OS version string */
    osVersion: {
      type: String,
      required: false,
      default: ""
    },
    /** Legacy free-text device info — kept for backward compat */
    deviceInfo: {
      type: String,
      required: false,
      default: ""
    },
    /** Raw user-agent string */
    userAgent: {
      type: String,
      required: false,
      default: ""
    },
    /** Platform tag: web | android | ios | pwa-ios */
    platform: {
      type: String,
      required: false,
      default: "web"
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true
    },
    /** When the user first subscribed */
    subscribedAt: {
      type: Date,
      required: false,
      default: () => new Date()
    },
    /** Last notification sent to this token */
    lastSentAt: {
      type: Date,
      required: false,
      default: null
    },
    /** Last FCM error encountered for this token */
    lastError: {
      type: String,
      required: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast lookups & subscriber counting
notificationTokenSchema.index({ userId: 1, isActive: 1 });
notificationTokenSchema.index({ isActive: 1, updatedAt: -1 });
notificationTokenSchema.index({ deviceType: 1, isActive: 1 });
notificationTokenSchema.index({ platform: 1, isActive: 1 });
notificationTokenSchema.index({ os: 1, isActive: 1 });

