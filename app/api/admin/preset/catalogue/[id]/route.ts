// next config
export const dynamic = "force-dynamic";

// handlers
import {
  handleDeleteCatalogue,
  handleGetCatalogue,
  handleUpdateCatalogue
} from "@/app/api/admin/preset/catalogue/handler";

// libraries
import { NextRequest } from "next/server";

// constants
import { DOMAIN, X_API_KEY } from "@/common/constants/environmentVariables";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type CatalogueDocument } from "@/common/types/documentation/presets/catalogue";

// methods
export const GET = handleGetCatalogue;

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<APIResponseType<CatalogueDocument>> => {
  const response = await handleUpdateCatalogue(req, { params });

  // Revalidate cache after updating catalogue
  if (response.status === 200) {
    fetch(`${DOMAIN}/api/admin/revalidate-cache/catalogue-categories`, {
      headers: { "x-api-key": X_API_KEY }
    }).catch(err => void 0);
  }

  return response;
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<APIResponseType<CatalogueDocument>> => {
  const response = await handleDeleteCatalogue(req, { params });

  // Revalidate cache after deleting catalogue
  if (response.status === 200) {
    fetch(`${DOMAIN}/api/admin/revalidate-cache/catalogue-categories`, {
      headers: { "x-api-key": X_API_KEY }
    }).catch(err => void 0);
  }

  return response;
};
