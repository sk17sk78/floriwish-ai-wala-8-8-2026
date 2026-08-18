// libraries
import { Schema } from "mongoose";

// schemas
import { genericPermissionSchema } from "@/db/mongoose/schema/nestedDocuments/genericPermission";

// types
import { type AdminRolePermissionDocument } from "@/common/types/documentation/nestedDocuments/adminRolePermission";

export const adminRolePermissionSchema =
  new Schema<AdminRolePermissionDocument>(
    {
      configs: {
        type: genericPermissionSchema,
        required: false
      },
      media: {
        type: genericPermissionSchema,
        required: false
      },
      product: {
        type: genericPermissionSchema,
        required: false
      },
      category: {
        type: genericPermissionSchema,
        required: false
      },
      pages: {
        type: genericPermissionSchema,
        required: false
      },
      order: {
        type: genericPermissionSchema,
        required: false
      },
      blog: {
        type: genericPermissionSchema,
        required: false
      },
      mobilecatgories: {
        type: genericPermissionSchema,
        required: false
      },
      settings: {
        type: genericPermissionSchema,
        required: false
      },
      support: {
        type: genericPermissionSchema,
        required: false
      },
      registrations: {
        type: genericPermissionSchema,
        required: false
      },
      notifications: {
        type: genericPermissionSchema,
        required: false
      }
    },
    { timestamps: true }
  );
