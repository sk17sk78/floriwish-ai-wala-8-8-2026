// next config
export const dynamic = "force-dynamic";

// controllers
import { getFooterSections } from "./controllers";

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
import { type FooterSectionDocument } from "@/common/types/documentation/pages/footerSection";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<FooterSectionDocument[]>> => {
  try {
    const documents = await getFooterSections();

    if (!documents) {
      return Response<FooterSectionDocument[]>(notFoundErrorResponse);
    }

    return Response(successData(documents));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

