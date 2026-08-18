import { Schema } from "mongoose";
import {
  PushNotificationLogDocument,
  PushNotificationLogModel
} from "@/common/types/documentation/notifications/pushNotificationLog";

export const pushNotificationLogSchema = new Schema<
  PushNotificationLogDocument,
  PushNotificationLogModel
>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: false,
      default: ""
    },
    clickUrl: {
      type: String,
      required: false,
      default: "/"
    },
    targetType: {
      type: String,
      enum: ["all", "loggedin", "guest", "mobile", "desktop", "tablet", "user"],
      default: "all"
    },
    targetLabel: {
      type: String,
      required: false,
      default: ""
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      default: null
    },
    totalSent: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    /** Number of tokens auto-deactivated due to expired/invalid registration */
    invalidCount: {
      type: Number,
      default: 0
    },
    /** Overall campaign delivery status */
    status: {
      type: String,
      enum: ["sent", "partial", "failed", "scheduled", "cancelled"],
      default: "sent"
    },
    /** Timestamp when the notification was dispatched to FCM */
    sentAt: {
      type: Date,
      required: false,
      default: null
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

pushNotificationLogSchema.index({ createdAt: -1 });
pushNotificationLogSchema.index({ status: 1, createdAt: -1 });

