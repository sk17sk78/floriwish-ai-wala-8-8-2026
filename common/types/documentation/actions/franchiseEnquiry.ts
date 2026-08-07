// libraries
import { Model } from "mongoose";

// types
import { type ActionDocument as Document } from "@/common/types/documentation/_document";

export type FranchiseEnquiryStatus = "new" | "contacted" | "closed";

// document
export interface FranchiseEnquiryDocument extends Document {
  status: FranchiseEnquiryStatus;
  name: string;
  phone: string;
  email: string;
  city: string;
  investmentRange: string;
  message?: string;
  submittedAt: Date;
}

// model
export interface FranchiseEnquiryModel extends Model<FranchiseEnquiryDocument> {}

