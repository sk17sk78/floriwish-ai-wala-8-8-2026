// next config
export const dynamic = "force-dynamic";

// controllers
import { getHomepageLayouts } from "./controllers";

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
import { type HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<HomepageLayoutDocument[]>> => {
  try {
    const documents = await getHomepageLayouts();

    if (!documents) {
      return Response<HomepageLayoutDocument[]>(notFoundErrorResponse);
    }

    return Response(successData(documents));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

