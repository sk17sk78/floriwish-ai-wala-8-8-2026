// libraries
import { Model } from "mongoose";

// types
import { type ActionDocument as Document } from "@/common/types/documentation/_document";

export type VendorRegistrationStatus = "new" | "contacted" | "converted" | "rejected";

// document
export interface VendorRegistrationDocument extends Document {
  status: VendorRegistrationStatus;
  fullName: string;
  email: string;
  businessName: string;
  city: string;
  interestedCategory: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  gstNumber?: string;
  foundUs?: string;
  socialPlatform?: string;
  socialLink?: string;
  submittedAt: Date;
}

// model
export interface VendorRegistrationModel extends Model<VendorRegistrationDocument> {}

