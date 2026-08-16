// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// controllers
import {
  getContentCategoryPageDetailsI,
  getContentCategoryPageDetailsII
} from "../controllers";

// constants
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

// utils
import {
  notFoundErrorResponse,
  serverErrorResponse
} from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type NextRequest } from "next/server";

// In-memory L1 cache
const inMemoryCategoryCache = new Map<string, { data: ContentCategoryDocument; timestamp: number }>();
const L1_TTL_MS = 60 * 1000; // 60 seconds

export const GET = async (
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } }
): Promise<APIResponseType<ContentCategoryDocument>> => {
  try {
    const now = Date.now();
    const l1 = inMemoryCategoryCache.get(slug);
    if (l1 && (now - l1.timestamp) < L1_TTL_MS) {
      return Response(successData(l1.data));
    }

    const cachedDocument = await getFromRedis<ContentCategoryDocument>({
      key: `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${slug}`
    });

    if (!cachedDocument) {
      const [i, ii] = await Promise.all([
        getContentCategoryPageDetailsI({ slug }),
        getContentCategoryPageDetailsII({ slug })
      ]);

      if (i === null || ii === null) {
        return Response<ContentCategoryDocument>(notFoundErrorResponse);
      }

      const document = i.toObject() as ContentCategoryDocument;

      document._page = ii._page;

      inMemoryCategoryCache.set(slug, { data: document, timestamp: now });

      await setToRedis({
        key: `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_${slug}`,
        value: document
      });

      return Response(successData(document));
    } else {
      inMemoryCategoryCache.set(slug, { data: cachedDocument, timestamp: now });
      return Response(successData(cachedDocument));
    }
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
