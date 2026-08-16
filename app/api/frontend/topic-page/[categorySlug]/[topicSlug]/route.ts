// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// controllers
import { getTopicPageDetailsI, getTopicPageDetailsII } from "../../controllers";

// constants
import { TOPIC_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

// utils
import {
  notFoundErrorResponse,
  serverErrorResponse
} from "@/common/utils/api/error";
import { Response } from "@/common/utils/api/next";
import { successData } from "@/common/utils/api/data";

// types
import { type APIResponseType } from "@/common/types/apiTypes";
import { type NextRequest } from "next/server";
import { type TopicDocument } from "@/common/types/documentation/pages/topic";

// In-memory L1 cache
const inMemoryTopicCache = new Map<string, { data: TopicDocument; timestamp: number }>();
const L1_TTL_MS = 60 * 1000; // 60 seconds

export const GET = async (
  req: NextRequest,
  {
    params: { categorySlug, topicSlug }
  }: { params: { categorySlug: string; topicSlug: string } }
): Promise<APIResponseType<TopicDocument>> => {
  try {
    const cacheKey = `${categorySlug}_${topicSlug}`;
    const now = Date.now();
    const l1 = inMemoryTopicCache.get(cacheKey);
    if (l1 && (now - l1.timestamp) < L1_TTL_MS) {
      return Response(successData(l1.data));
    }

    const cachedDocument = await getFromRedis<TopicDocument>({
      key: `${TOPIC_PAGE_CACHE_KEY}_${categorySlug}_${topicSlug}`
    });

    if (!cachedDocument) {
      const [i, ii] = await Promise.all([
        getTopicPageDetailsI({ categorySlug, topicSlug }),
        getTopicPageDetailsII({ categorySlug, topicSlug })
      ]);

      if (!i || !ii) {
        return Response<TopicDocument>(notFoundErrorResponse);
      }

      const document = (typeof (i as any).toObject === "function" ? (i as any).toObject() : { ...i }) as TopicDocument;

      document._page = ii._page;

      inMemoryTopicCache.set(cacheKey, { data: document, timestamp: now });

      await setToRedis({
        key: `${TOPIC_PAGE_CACHE_KEY}_${categorySlug}_${topicSlug}`,
        value: document
      });

      return Response(successData(document));
    } else {
      inMemoryTopicCache.set(cacheKey, { data: cachedDocument, timestamp: now });
      return Response(successData(cachedDocument));
    }
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
