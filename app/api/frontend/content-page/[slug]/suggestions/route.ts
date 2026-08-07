// next config
export const dynamic = "force-dynamic";

// controllers
import {
  getContentPageDetailsV
} from "../../controllers";

// utils
import {
  notFoundErrorResponse,
  serverErrorResponse
} from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } }
): Promise<APIResponseType<ContentDocument>> => {
  try {
    const suggestions = await getContentPageDetailsV({ slug });

    if (!suggestions) {
      return Response<ContentDocument>(notFoundErrorResponse);
    }

    return Response(successData(suggestions));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
