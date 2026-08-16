// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleAddCatalogues,
  handleDeleteCatalogues,
  handleGetCatalogues,
  handleUpdateCatalogues
} from "@/app/api/admin/preset/catalogue/handler";

// methods
export const GET = handleGetCatalogues;
export const POST = handleAddCatalogues;
export const PATCH = handleUpdateCatalogues;
export const DELETE = handleDeleteCatalogues;
