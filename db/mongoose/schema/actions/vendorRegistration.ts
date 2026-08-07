// libraries
import { Schema } from "mongoose";

// types
import {
  type VendorRegistrationDocument,
  type VendorRegistrationModel
} from "@/common/types/documentation/actions/vendorRegistration";

export const vendorRegistrationSchema = new Schema<
  VendorRegistrationDocument,
  VendorRegistrationModel
>(
  {
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "rejected"],
      required: true,
      default: "new"
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    businessName: { type: String, required: true },
    city: { type: String, required: true },
    interestedCategory: { type: String, required: true },
    mobile: { type: String, required: true },
    whatsapp: { type: String, required: false },
    address: { type: String, required: true },
    gstNumber: { type: String, required: false },
    foundUs: { type: String, required: false },
    socialPlatform: { type: String, required: false },
    socialLink: { type: String, required: false },
    submittedAt: { type: Date, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
    createdBy: { type: String, required: false },
    updatedBy: { type: String, required: false }
  },
  { timestamps: true }
);

vendorRegistrationSchema.index({
  fullName: "text",
  email: "text",
  businessName: "text",
  mobile: "text",
  city: "text"
});

