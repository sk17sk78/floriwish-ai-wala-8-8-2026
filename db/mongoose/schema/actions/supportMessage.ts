// libraries
import { Schema } from "mongoose";

// types
import {
  type SupportMessageDocument,
  type SupportMessageModel
} from "@/common/types/documentation/actions/supportMessage";

export const supportMessageSchema = new Schema<
  SupportMessageDocument,
  SupportMessageModel
>(
  {
    status: {
      type: String,
      enum: ["new", "responded", "closed"],
      required: true,
      default: "new"
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    submittedAt: { type: Date, required: true },
    createdBy: { type: String, required: false },
    updatedBy: { type: String, required: false }
  },
  { timestamps: true }
);

supportMessageSchema.index({
  name: "text",
  email: "text",
  phone: "text",
  subject: "text"
});
