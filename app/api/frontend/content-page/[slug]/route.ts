// next config
export const dynamic = "force-dynamic";

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// controllers
import {
  getContentPageDetailsI,
  getContentPageDetailsII,
  getContentPageDetailsIII,
  getContentPageDetailsIV,
  getCoupons
} from "../controllers";

// constants
import { CONTENT_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

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
  const startTime = Date.now();
  const cacheKey = `${CONTENT_PAGE_CACHE_KEY}_${slug}`;
  
  try {
    // Try to get from Redis cache first
    const cachedDocument = await getFromRedis<ContentDocument>({
      key: cacheKey
    });

    if (cachedDocument) {
      const duration = Date.now() - startTime;
      return Response(successData(cachedDocument));
    }
    // Cache miss - fetch from MongoDB
    const [i, ii, iii, iv] = await Promise.all([
      getContentPageDetailsI({ slug }),
      getContentPageDetailsII({ slug }),
      getContentPageDetailsIII({ slug }),
      getContentPageDetailsIV({ slug })
    ]);

    if (!i || !ii || !iii || !iv) {
      return Response<ContentDocument>(notFoundErrorResponse);
    }

    const document = i.toObject() as ContentDocument;

    // Fetch coupons separately using the primary category ID
    const coupons = await getCoupons({ 
      categoryId: (document.category.primary as any)?._id || document.category.primary 
    });

    document.availability = ii.availability;
    document.customization = iii.customization;
    document.addons = iii.addons;
    document.variants = iv.variants;
    document._coupons = coupons;
    // document._suggestions = v._suggestions; // Skip suggestions for faster initial load

    // Cache the result in Redis for 1 hour (3600 seconds)
    const cacheSet = await setToRedis({
      key: cacheKey,
      value: document,
      ttl: 3600
    });
    
    const duration = Date.now() - startTime;
    return Response(successData(document));
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return Response<null>(serverErrorResponse);
  }
};
