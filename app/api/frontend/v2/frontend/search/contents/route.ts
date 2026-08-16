// next config
export const dynamic = "force-dynamic";

import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { NextRequest } from "next/server";
import { serverErrorResponse } from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";
import { APIResponseType } from "@/common/types/apiTypes";
import { getContents } from "./controller";

// In-memory L1 cache
const inMemorySearchContentsCache = new Map<string, { data: any[]; timestamp: number }>();
const L1_TTL_MS = 60 * 1000; // 60 seconds

export const GET = async (
  req: NextRequest
): Promise<APIResponseType<any>> => {
  try {
    const cityIdParam = req.nextUrl.searchParams.get("cityId");
    const key = req.nextUrl.searchParams.get("key");
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : 40;

    const cityId =
      !cityIdParam || cityIdParam === "null" || cityIdParam.length !== 24
        ? "base"
        : cityIdParam;

    const cacheKey = key
      ? `search_contents_${cityId}_${key.trim().toLowerCase().replace(/\s+/g, "_")}_${limit}`
      : `search_contents_${cityId}_all_${limit}`;

    const now = Date.now();
    const l1 = inMemorySearchContentsCache.get(cacheKey);
    if (l1 && (now - l1.timestamp) < L1_TTL_MS) {
      return Response(successData(l1.data));
    }

    const cachedContents = await getFromRedis<any[]>({ key: cacheKey });

    if (cachedContents && Array.isArray(cachedContents)) {
      inMemorySearchContentsCache.set(cacheKey, { data: cachedContents, timestamp: now });
      return Response(successData(cachedContents));
    }

    const contentsFromDb = await getContents({
      cityId: cityId === "base" ? null : cityId,
      key: key,
      limit: limit
    });

    const contents = contentsFromDb || [];

    inMemorySearchContentsCache.set(cacheKey, { data: contents, timestamp: now });

    await setToRedis({
      key: cacheKey,
      value: contents
    });

    return Response(successData(contents));
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

