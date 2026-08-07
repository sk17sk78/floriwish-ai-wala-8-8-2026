// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleDeleteSupportMessage,
  handleGetSupportMessage,
  handleUpdateSupportMessage
} from "@/app/api/admin/action/support-message/handler";

// methods
export const GET = handleGetSupportMessage;
export const PATCH = handleUpdateSupportMessage;
export const DELETE = handleDeleteSupportMessage;
