import { Schema, Document, Model } from "mongoose";

export interface IModuleStepResult {
  moduleKey: string;
  moduleName: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  durationMs?: number;
  keysCount?: number;
  error?: string;
}

export interface IRedisCacheAuditLogDocument extends Document {
  adminName: string;
  adminEmail?: string;
  action: "FULL_RESET" | "PARTIAL_REBUILD" | "FLUSH_ONLY";
  status: "in_progress" | "completed" | "failed" | "partially_completed";
  startedAt: Date;
  completedAt?: Date;
  durationMs: number;
  totalKeysCleared: number;
  totalKeysRebuilt: number;
  moduleResults: IModuleStepResult[];
  failedModules: string[];
  errorMessage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IRedisCacheAuditLogModel = Model<IRedisCacheAuditLogDocument>;

const moduleStepResultSchema = new Schema(
  {
    moduleKey: { type: String, required: true },
    moduleName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed", "skipped"],
      default: "pending"
    },
    durationMs: { type: Number, default: 0 },
    keysCount: { type: Number, default: 0 },
    error: { type: String, default: "" }
  },
  { _id: false }
);

export const redisCacheAuditLogSchema = new Schema<
  IRedisCacheAuditLogDocument,
  IRedisCacheAuditLogModel
>(
  {
    adminName: {
      type: String,
      required: true,
      default: "Admin"
    },
    adminEmail: {
      type: String,
      default: ""
    },
    action: {
      type: String,
      enum: ["FULL_RESET", "PARTIAL_REBUILD", "FLUSH_ONLY"],
      default: "FULL_RESET"
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed", "partially_completed"],
      default: "in_progress",
      index: true
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: 0
    },
    totalKeysCleared: {
      type: Number,
      default: 0
    },
    totalKeysRebuilt: {
      type: Number,
      default: 0
    },
    moduleResults: [
      {
        type: moduleStepResultSchema,
        default: []
      }
    ],
    failedModules: [
      {
        type: String,
        default: []
      }
    ],
    errorMessage: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

redisCacheAuditLogSchema.index({ createdAt: -1 });
