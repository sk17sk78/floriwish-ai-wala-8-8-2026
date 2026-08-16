import { Schema, Document, Model } from "mongoose";

export interface ICategoryBannerJobDocument extends Document {
  bannerId: Schema.Types.ObjectId | string;
  bannerTitle: string;
  type: "BULK_APPLY" | "BULK_REMOVE" | "REDIS_PURGE";
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  totalCategories: number;
  processedCategories: number;
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
  failedCategories: string[];
  initiatedBy: string;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  logs: Array<{
    timestamp: Date;
    message: string;
    level: "info" | "warn" | "error";
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export type ICategoryBannerJobModel = Model<ICategoryBannerJobDocument>;

export const categoryBannerJobSchema = new Schema<
  ICategoryBannerJobDocument,
  ICategoryBannerJobModel
>(
  {
    bannerId: {
      type: Schema.Types.ObjectId,
      ref: "GlobalCategoryBanner",
      required: false
    },
    bannerTitle: {
      type: String,
      required: true,
      default: ""
    },
    type: {
      type: String,
      enum: ["BULK_APPLY", "BULK_REMOVE", "REDIS_PURGE"],
      default: "BULK_APPLY"
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed", "cancelled"],
      default: "queued",
      index: true
    },
    totalCategories: {
      type: Number,
      default: 0
    },
    processedCategories: {
      type: Number,
      default: 0
    },
    batchSize: {
      type: Number,
      default: 50
    },
    currentBatch: {
      type: Number,
      default: 0
    },
    totalBatches: {
      type: Number,
      default: 0
    },
    failedCategories: {
      type: [String],
      default: []
    },
    initiatedBy: {
      type: String,
      default: "Admin"
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    errorMessage: {
      type: String,
      default: ""
    },
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: { type: String, required: true },
        level: { type: String, enum: ["info", "warn", "error"], default: "info" }
      }
    ]
  },
  { timestamps: true }
);

categoryBannerJobSchema.index({ status: 1, createdAt: -1 });
