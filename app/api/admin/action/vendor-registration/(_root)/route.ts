// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleAddVendorRegistrations,
  handleGetVendorRegistrations
} from "@/app/api/admin/action/vendor-registration/handler";

// methods
export const GET = handleGetVendorRegistrations;
export const POST = handleAddVendorRegistrations;

