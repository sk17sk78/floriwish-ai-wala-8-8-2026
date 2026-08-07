// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleAddSupportMessages,
  handleGetSupportMessages
} from "@/app/api/admin/action/support-message/handler";

// methods
export const GET = handleGetSupportMessages;
export const POST = handleAddSupportMessages;
