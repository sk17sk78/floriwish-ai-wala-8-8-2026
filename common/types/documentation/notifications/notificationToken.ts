import { Model, Types } from "mongoose";

export interface NotificationTokenDocument {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  token: string;
  deviceInfo?: string;
  userAgent?: string;
  platform?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationTokenModel = Model<NotificationTokenDocument>;
