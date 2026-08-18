// libraries
import { Schema } from "mongoose";

// schemas
import { permissionSchema } from "@/db/mongoose/schema/nestedDocuments/permission";

/**
 * Generic permission schema used for sections whose sub-section keys
 * are managed in application logic (not strongly typed in the DB schema).
 * `custom` is stored as Mixed so any sub-section key can be persisted.
 */
export const genericPermissionSchema = new Schema(
  {
    isCustomized: {
      type: Boolean,
      required: false,
      default: false
    },
    all: {
      type: permissionSchema,
      required: false
    },
    custom: {
      type: Schema.Types.Mixed,
      required: false,
      default: {}
    }
  },
  { timestamps: true }
);
