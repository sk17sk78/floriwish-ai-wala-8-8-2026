import { Model, Types } from "mongoose";

export interface PushNotificationLogDocument {
  _id: Types.ObjectId;
  title: string;
  message: string;
  imageUrl?: string;
  clickUrl?: string;
  targetType: "all" | "user" | "guest";
  targetUserId?: Types.ObjectId;
  totalSent: number;
  successCount: number;
  failureCount: number;
  sentBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PushNotificationLogModel = Model<PushNotificationLogDocument>;
