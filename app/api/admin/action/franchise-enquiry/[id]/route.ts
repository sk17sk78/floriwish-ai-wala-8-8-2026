// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleDeleteFranchiseEnquiry,
  handleGetFranchiseEnquiry,
  handleUpdateFranchiseEnquiry
} from "@/app/api/admin/action/franchise-enquiry/handler";

// methods
export const GET = handleGetFranchiseEnquiry;
export const PATCH = handleUpdateFranchiseEnquiry;
export const DELETE = handleDeleteFranchiseEnquiry;

