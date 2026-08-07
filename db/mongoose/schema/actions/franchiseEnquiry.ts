// libraries
import { Schema } from "mongoose";

// types
import {
  type FranchiseEnquiryDocument,
  type FranchiseEnquiryModel
} from "@/common/types/documentation/actions/franchiseEnquiry";

export const franchiseEnquirySchema = new Schema<
  FranchiseEnquiryDocument,
  FranchiseEnquiryModel
>(
  {
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      required: true,
      default: "new"
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    investmentRange: { type: String, required: true },
    message: { type: String, required: false },
    submittedAt: { type: Date, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
    createdBy: { type: String, required: false },
    updatedBy: { type: String, required: false }
  },
  { timestamps: true }
);

franchiseEnquirySchema.index({
  name: "text",
  email: "text",
  phone: "text",
  city: "text"
});

