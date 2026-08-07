// libraries
import { Model } from "mongoose";

// types
import { type ActionDocument as Document } from "@/common/types/documentation/_document";

export type SupportMessageStatus = "new" | "responded" | "closed";

// document
export interface SupportMessageDocument extends Document {
  status: SupportMessageStatus;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

// model
export interface SupportMessageModel extends Model<SupportMessageDocument> {}
