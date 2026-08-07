// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleAddFranchiseEnquiries,
  handleGetFranchiseEnquiries
} from "@/app/api/admin/action/franchise-enquiry/handler";

// methods
export const GET = handleGetFranchiseEnquiries;
export const POST = handleAddFranchiseEnquiries;

