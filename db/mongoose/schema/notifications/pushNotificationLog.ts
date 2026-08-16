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
      enum: ["all", "user", "guest"],
      default: "all"
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
