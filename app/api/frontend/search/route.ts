// next config
export const dynamic = "force-dynamic";

// controllers
import { getAITags, getContentCategories, getContents } from "./controllers";

// constants
import {
  notFoundErrorResponse,
  serverErrorResponse,
} from "@/common/utils/api/error";

// utils
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type AITagDocument } from "@/common/types/documentation/presets/aiTag";
import { type APIResponseType } from "@/common/types/apiTypes";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type NextRequest, NextResponse } from "next/server";
import { connectRedis, redisClient } from "@/db/redis/redis-client";

// In-memory L1 cache for search (<1ms response)
let inMemorySearchPayloadCache: {
  data: {
    aiTags: AITagDocument[];
    categories: ContentCategoryDocument[];
    contents: ContentDocument[];
  };
  timestamp: number;
} | null = null;
const SEARCH_L1_TTL_MS = 60 * 1000;

export const GET = async (
  req: NextRequest,
): Promise<
  APIResponseType<{
    aiTags: AITagDocument[];
    categories: ContentCategoryDocument[];
    contents: ContentDocument[];
  }>
> => {
  try {
    const now = Date.now();

    // 1. Check In-Memory L1 Cache
    if (
      inMemorySearchPayloadCache &&
      now - inMemorySearchPayloadCache.timestamp < SEARCH_L1_TTL_MS
    ) {
      return Response(successData(inMemorySearchPayloadCache.data));
    }

    // 2. Check Redis L2 Cache
    let cachedData: string | null = null;
    try {
      await connectRedis();
      cachedData = await redisClient.get("search");
    } catch (redisError) {
      // Graceful fallback to direct DB queries
    }

    if (!cachedData) {
      const [aiTags, categories, contents] = await Promise.all([
        getAITags(),
        getContentCategories(),
        getContents(),
      ]);

      if (!aiTags || !categories || !contents) {
        return Response<{
          aiTags: AITagDocument[];
          categories: ContentCategoryDocument[];
          contents: ContentDocument[];
        }>(notFoundErrorResponse);
      }

      const payload = { aiTags, categories, contents };
      inMemorySearchPayloadCache = { data: payload, timestamp: now };

      try {
        await redisClient.set(
          "search",
          JSON.stringify(payload),
          { EX: 300 }
        );
      } catch (redisSetError) {
        // Ignore cache write error
      }

      return Response(successData(payload));
    } else {
      const parsed = JSON.parse(cachedData);
      inMemorySearchPayloadCache = { data: parsed, timestamp: now };
      return Response(
        successData({
          aiTags: parsed.aiTags,
          categories: parsed.categories,
          contents: parsed.contents,
        }),
      );
    }
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};

// Flush the search Redis cache
export const DELETE = async (): Promise<NextResponse> => {
  try {
    await connectRedis();
    await redisClient.del("search");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
};
