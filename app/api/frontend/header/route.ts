// next config
export const dynamic = "force-dynamic";

// controllers
import { getNavLinks } from "./controllers";

// constants
import {
  notFoundErrorResponse,
  serverErrorResponse
} from "@/common/utils/api/error";

// utils
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<HeaderNavLinkDocument[]>> => {
  try {
    const documents = await getNavLinks();

    if (!documents) {
      return Response<HeaderNavLinkDocument[]>(notFoundErrorResponse);
    }

    return Response(successData(documents));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

