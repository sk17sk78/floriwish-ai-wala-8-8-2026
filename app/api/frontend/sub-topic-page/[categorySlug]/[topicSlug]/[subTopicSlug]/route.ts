// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// controllers
import {
  getSubTopicPageDetailsI,
  getSubTopicPageDetailsII
} from "../../../controllers";

// constants
import { SUB_TOPIC_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

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
import { type SubTopicDocument } from "@/common/types/documentation/pages/subTopic";

// In-memory L1 cache
const inMemorySubTopicCache = new Map<string, { data: SubTopicDocument; timestamp: number }>();
const L1_TTL_MS = 60 * 1000; // 60 seconds

export const GET = async (
  req: NextRequest,
  {
    params: { categorySlug, topicSlug, subTopicSlug }
  }: {
    params: { categorySlug: string; topicSlug: string; subTopicSlug: string };
  }
): Promise<APIResponseType<SubTopicDocument>> => {
  try {
    const cacheKey = `${categorySlug}_${topicSlug}_${subTopicSlug}`;
    const now = Date.now();
    const l1 = inMemorySubTopicCache.get(cacheKey);
    if (l1 && (now - l1.timestamp) < L1_TTL_MS) {
      return Response(successData(l1.data));
    }

    const cachedDocument = await getFromRedis<SubTopicDocument>({
      key: `${SUB_TOPIC_PAGE_CACHE_KEY}_${categorySlug}_${topicSlug}_${subTopicSlug}`
    });

    if (!cachedDocument) {
      const [i, ii] = await Promise.all([
        getSubTopicPageDetailsI({ categorySlug, topicSlug, subTopicSlug }),
        getSubTopicPageDetailsII({ categorySlug, topicSlug, subTopicSlug })
      ]);

      if (!i || !ii) {
        return Response<SubTopicDocument>(notFoundErrorResponse);
      }

      const document = (typeof (i as any).toObject === "function" ? (i as any).toObject() : { ...i }) as SubTopicDocument;

      document._page = ii._page;

      inMemorySubTopicCache.set(cacheKey, { data: document, timestamp: now });

      await setToRedis({
        key: `${SUB_TOPIC_PAGE_CACHE_KEY}_${categorySlug}_${topicSlug}_${subTopicSlug}`,
        value: document
      });

      return Response(successData(document));
    } else {
      inMemorySubTopicCache.set(cacheKey, { data: cachedDocument, timestamp: now });
      return Response(successData(cachedDocument));
    }
  } catch (error: any) {
    return Response<null>(serverErrorResponse);
  }
};
