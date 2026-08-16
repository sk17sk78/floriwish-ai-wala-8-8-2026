import { Schema, Document, Model } from "mongoose";

export interface ICategoryBannerAuditLogDocument extends Document {
  bannerId?: Schema.Types.ObjectId | string;
  action: "CREATE" | "UPDATE" | "DELETE" | "ACTIVATE" | "DEACTIVATE" | "REDIS_REFRESH" | "BULK_APPLY" | "REVERT";
  bannerTitle: string;
  performedBy: string;
  affectedCategoriesCount: number;
  previousState?: any;
  newState?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ICategoryBannerAuditLogModel = Model<ICategoryBannerAuditLogDocument>;

export const categoryBannerAuditLogSchema = new Schema<
  ICategoryBannerAuditLogDocument,
  ICategoryBannerAuditLogModel
>(
  {
    bannerId: {
      type: Schema.Types.ObjectId,
      ref: "GlobalCategoryBanner",
      required: false
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "ACTIVATE", "DEACTIVATE", "REDIS_REFRESH", "BULK_APPLY", "REVERT"],
      required: true
    },
    bannerTitle: {
      type: String,
      required: false,
      default: ""
    },
    performedBy: {
      type: String,
      required: true,
      default: "Admin"
    },
    affectedCategoriesCount: {
      type: Number,
      required: false,
      default: 0
    },
    previousState: {
      type: Schema.Types.Mixed,
      required: false
    },
    newState: {
      type: Schema.Types.Mixed,
      required: false
    },
    notes: {
      type: String,
      required: false,
      default: ""
    }
  },
  { timestamps: true }
);

categoryBannerAuditLogSchema.index({ createdAt: -1 });
