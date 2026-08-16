// libraries
import { Schema } from "mongoose";

// types
import {
  ReviewDocument,
  ReviewModel
} from "@/common/types/documentation/dynamic/review";

// schema
export const reviewSchema = new Schema<ReviewDocument, ReviewModel>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false
    },
    customerName: {
      type: String,
      required: false,
      trim: true
    },
    customerCity: {
      type: String,
      required: false,
      trim: true
    },
    content: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true
    },
    contentName: {
      type: String,
      required: false,
      trim: true
    },
    contentSlug: {
      type: String,
      required: false,
      trim: true
    },
    contentType: {
      type: String,
      enum: ["product", "service"],
      default: "product"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: false,
      trim: true
    },
    photos: [
      {
        type: String,
        required: false
      }
    ],
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "ReviewImage",
        required: false
      }
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false
    },
    createdBy: {
      type: String,
      required: false
    },
    updatedBy: {
      type: String,
      required: false
    }
  },
  { timestamps: true, strict: false }
);

// search index
reviewSchema.index({
  content: 1,
  status: 1,
  createdAt: -1
});

reviewSchema.index({
  customerName: "text",
  customerCity: "text",
  review: "text",
  contentName: "text"
});
