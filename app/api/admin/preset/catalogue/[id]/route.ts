// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleDeleteCatalogue,
  handleGetCatalogue,
  handleUpdateCatalogue
} from "@/app/api/admin/preset/catalogue/handler";

// methods
export const GET = handleGetCatalogue;
export const PATCH = handleUpdateCatalogue;
export const DELETE = handleDeleteCatalogue;
