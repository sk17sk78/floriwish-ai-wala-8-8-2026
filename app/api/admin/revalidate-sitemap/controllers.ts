// libraries
import { cloudfront } from "@/lib/aws";
import { del as clearRedis } from "@/db/redis/methods";

// types
import { type RevalidateImageCache } from "@/common/types/revalidateCache";

export const clearCache = async ({
  redisKeys,
  cloudfrontPath
}: {
  redisKeys: string[];
  cloudfrontPath: string;
}): Promise<RevalidateImageCache> => {
  try {
    // Clear Redis cache
    const isRedisCleared = await clearRedis({ keys: redisKeys });

    // Clear CloudFront cache (non-blocking, graceful failure)
    let isCloudfrontCleared = false;
    
    try {
      const result = await cloudfront.cache.clear([cloudfrontPath]);
      isCloudfrontCleared = !!result;
      
      if (isCloudfrontCleared) {
      } else {
      }
    } catch (cfError: any) {
      isCloudfrontCleared = false;
    }

    return {
      redis: isRedisCleared,
      cloudfront: isCloudfrontCleared
    };
  } catch (error) {
    return {
      redis: false,
      cloudfront: false
    };
  }
};
