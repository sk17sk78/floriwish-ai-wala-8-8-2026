// types
import { type NestedDocument as Document } from "@/common/types/documentation/_document";

type Permission = {
  isCustomized: boolean;
  all?: { create: boolean; read: boolean; update: boolean; delete: boolean };
  custom?: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
};

export interface AdminRolePermissionDocument extends Document {
  configs?: Permission;        // Configurations (presets)
  media?: Permission;          // Media
  product?: Permission;        // Product & Addons
  category?: Permission;       // Category Page
  pages?: Permission;          // Website Pages
  order?: Permission;          // Users & Payments
  blog?: Permission;           // Blogs
  mobilecatgories?: Permission; // Mobile Categories
  settings?: Permission;       // Miscellaneous
  support?: Permission;        // Customer Support
  registrations?: Permission;  // Registrations
  notifications?: Permission;  // Push Notifications
}
