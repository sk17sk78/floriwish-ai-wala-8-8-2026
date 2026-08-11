// next config
export const dynamic = "force-dynamic";

import { connectRedis, redisClient } from "@/db/redis/redis-client";
import { NextRequest } from "next/server";
import { serverErrorResponse } from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";
import { APIResponseType } from "@/common/types/apiTypes";
import { getContents } from "./controller";

const REDIS_KEY_CONTENTS = "search-contents";

const isEmpty = (str: string | null) => (str && str.length > 0 ? false : true);

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<any>> => {
  try {
    await connectRedis();

    const cityIdParam = req.nextUrl.searchParams.get("cityId");
    const key = req.nextUrl.searchParams.get("key");
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 40;

    const cityId =
      !cityIdParam || cityIdParam === "null" || cityIdParam.length !== 24
        ? "base"
        : cityIdParam;

    const redisKey = key
      ? `${REDIS_KEY_CONTENTS}-${cityId}-${key.trim().toLowerCase().replace(/\s+/g, "_")}-${limit}`
      : `${REDIS_KEY_CONTENTS}-${cityId}-${limit}`;

    let cachedContents = await redisClient.get(redisKey);
    let contents: any[] = [];
    let isCachedValid = false;

    if (cachedContents && cachedContents !== "[]" && cachedContents !== "null") {
      try {
        const parsed = JSON.parse(cachedContents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          contents = parsed;
          isCachedValid = true;
        }
      } catch {
        isCachedValid = false;
      }
    }

    if (!isCachedValid) {
      let contentsFromDb = await getContents({
        cityId: cityId === "base" ? null : cityId,
        key: key,
        limit: limit
      });

      if (!contentsFromDb) contentsFromDb = [];
      else if (contentsFromDb.length > 0) {
        await redisClient.set(
          redisKey,
          JSON.stringify(contentsFromDb),
          { EX: 1800 } // Cache non-empty for 30 mins
        );
      }

      contents = contentsFromDb;
    }

    return Response(successData(contents));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
