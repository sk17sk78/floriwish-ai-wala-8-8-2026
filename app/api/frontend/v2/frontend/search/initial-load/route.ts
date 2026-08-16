// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { NextRequest, NextResponse } from "next/server";

// controllers
import {
  getAITags,
  getContentCategories,
  getTrendingSearchKeywords
} from "./controller";

// constants
import {
  SEARCH_AI_TAG_CACHE_KEY,
  SEARCH_CONTENT_CATEGORY_CACHE_KEY,
  SEARCH_TRENDING_KEYWORDS_CACHE_KEY
} from "@/common/constants/cacheKeys";

// utils
import { serverErrorResponse } from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";

// types
import { type AITagDocument } from "@/common/types/documentation/presets/aiTag";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type TrendingSearchKeywordDocument } from "@/common/types/documentation/presets/trendingSearchKeyword";

// In-memory L1 cache
let inMemorySearchInitialLoadCache: { data: any; timestamp: number } | null = null;
const L1_TTL_MS = 60 * 1000; // 60 seconds

export const GET = async (req: NextRequest) => {
  try {
    const now = Date.now();
    if (inMemorySearchInitialLoadCache && (now - inMemorySearchInitialLoadCache.timestamp) < L1_TTL_MS) {
      return NextResponse.json(inMemorySearchInitialLoadCache.data, { status: 200 });
    }

    const cachedAITags = await getFromRedis<AITagDocument[]>({
      key: SEARCH_AI_TAG_CACHE_KEY
    });
    const cachedCategories = await getFromRedis<ContentCategoryDocument[]>({
      key: SEARCH_CONTENT_CATEGORY_CACHE_KEY
    });
    const cachedTrendingKeywords = await getFromRedis<
      TrendingSearchKeywordDocument[]
    >({
      key: SEARCH_TRENDING_KEYWORDS_CACHE_KEY
    });

    let aiTags: AITagDocument[],
      categories: ContentCategoryDocument[],
      trendingKeywords: TrendingSearchKeywordDocument[];

    if (!cachedAITags) {
      let aiTagsFromDb = await getAITags();

      if (aiTagsFromDb) {
        await setToRedis({
          key: SEARCH_AI_TAG_CACHE_KEY,
          value: aiTagsFromDb
        });
      }

      aiTags = aiTagsFromDb || [];
    } else {
      aiTags = cachedAITags;
    }

    if (!cachedCategories) {
      let categoriesFromDb = await getContentCategories();

      if (categoriesFromDb) {
        await setToRedis({
          key: SEARCH_CONTENT_CATEGORY_CACHE_KEY,
          value: categoriesFromDb
        });
      }

      categories = categoriesFromDb || [];
    } else {
      categories = cachedCategories;
    }

    if (!cachedTrendingKeywords) {
      let trendingKeywordsFromDb = await getTrendingSearchKeywords();

      if (trendingKeywordsFromDb) {
        await setToRedis({
          key: SEARCH_TRENDING_KEYWORDS_CACHE_KEY,
          value: trendingKeywordsFromDb
        });
      }

      trendingKeywords = trendingKeywordsFromDb || [];
    } else {
      trendingKeywords = cachedTrendingKeywords;
    }

    const responsePayload = { aiTags, categories, trendingKeywords };
    inMemorySearchInitialLoadCache = { data: responsePayload, timestamp: now };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
