import { Model, Types } from "mongoose";

export type PushNotificationLogStatus = "sent" | "partial" | "failed" | "scheduled" | "cancelled";

export interface PushNotificationLogDocument {
  _id: Types.ObjectId;
  title: string;
  message: string;
  imageUrl?: string;
  clickUrl?: string;
  targetType: "all" | "loggedin" | "guest" | "mobile" | "desktop" | "tablet" | "user";
  /** Human-readable label for the target audience */
  targetLabel?: string;
  targetUserId?: Types.ObjectId | null;
  totalSent: number;
  successCount: number;
  failureCount: number;
  /** Count of tokens deactivated due to invalid/expired registration */
  invalidCount: number;
  /** Overall campaign status */
  status: PushNotificationLogStatus;
  /** Timestamp when the notification was actually dispatched */
  sentAt?: Date | null;
  sentBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PushNotificationLogModel = Model<PushNotificationLogDocument>;
