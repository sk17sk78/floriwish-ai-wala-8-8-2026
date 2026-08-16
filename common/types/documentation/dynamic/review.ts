// libraries
import { Model, ObjectId } from "mongoose";

// types
import { type DynamicDocument as Document } from "@/common/types/documentation/_document";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type CustomerDocument } from "@/common/types/documentation/users/customer";
import { type ReviewImageDocument } from "@/common/types/documentation/media/reviewImage";

export type ReviewStatus = "pending" | "approved" | "rejected";

// document
export interface ReviewDocument extends Document {
  customer?: string | ObjectId | CustomerDocument;
  customerName?: string;
  customerCity?: string;
  content: string | ObjectId | ContentDocument;
  contentName?: string;
  contentSlug?: string;
  contentType?: "product" | "service";
  rating: number;
  review?: string;
  photos?: string[];
  images?: string[] | ObjectId[] | ReviewImageDocument[];
  status?: ReviewStatus;
  isActive: boolean;
  isDeleted: boolean;
  isVerified?: boolean;
}

// model
export interface ReviewModel extends Model<ReviewDocument> {}
