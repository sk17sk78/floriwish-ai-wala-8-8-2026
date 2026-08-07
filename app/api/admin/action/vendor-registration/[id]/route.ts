// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleDeleteVendorRegistration,
  handleGetVendorRegistration,
  handleUpdateVendorRegistration
} from "@/app/api/admin/action/vendor-registration/handler";

// methods
export const GET = handleGetVendorRegistration;
export const PATCH = handleUpdateVendorRegistration;
export const DELETE = handleDeleteVendorRegistration;

