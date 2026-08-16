// next config
export const dynamic = "force-dynamic";

// controllers
import { getSetting } from "./controllers";

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
import { type NextRequest, NextResponse } from "next/server";
import { type SettingDocument } from "@/common/types/documentation/settings/setting";

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<SettingDocument>> => {
  try {
    const document = await getSetting();

    if (!document) {
      return Response<SettingDocument>(notFoundErrorResponse);
    }

    const res = Response(successData(document));
    // Setting data changes rarely — cache aggressively at CDN + browser level
    (res as any).headers?.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res;
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

