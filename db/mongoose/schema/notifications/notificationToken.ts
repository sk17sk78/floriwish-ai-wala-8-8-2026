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
    deviceInfo: {
      type: String,
      required: false,
      default: ""
    },
    userAgent: {
      type: String,
      required: false,
      default: ""
    },
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
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast lookups & subscriber counting
notificationTokenSchema.index({ userId: 1, isActive: 1 });
notificationTokenSchema.index({ isActive: 1, updatedAt: -1 });
