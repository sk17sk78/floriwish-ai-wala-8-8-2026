import { ALL_CACHE_KEY } from "@/common/constants/cacheKeys";
import { flush } from "@/db/redis/methods";
import { cloudfront } from "@/lib/aws";
import { revalidateTag } from "next/cache";

/* ---------------------------------------
   Reset ALL caches (Redis + Next + CF)
---------------------------------------- */
export const resetAllCache = async (): Promise<boolean> => {
  try {
    // 1️⃣ Clear Redis
    await flush();

    // 2️⃣ Revalidate Next.js cache
    revalidateTag(ALL_CACHE_KEY);

    // 3️⃣ Clear CloudFront cache (non-blocking, graceful failure)
    try {
      await cloudfront.cache.clear(["/*"]);
    } catch (cloudfrontError: any) {
      console.warn("Cloudfront cache clear skipped or failed gracefully:", cloudfrontError?.message || cloudfrontError);
    }

    return true;
  } catch (error) {
    console.error("resetAllCache failed:", error);
    return false;
  }
};

/* ---------------------------------------
   Reset ONLY Redis cache
---------------------------------------- */
export const resetRedisCache = async (): Promise<boolean> => {
  try {
    await flush();
    return true;
  } catch (error) {
    console.error("resetRedisCache failed:", error);
    return false;
  }
};

/* ---------------------------------------
   Reset ONLY Next.js cache
---------------------------------------- */
export const resetNextCache = async (): Promise<boolean> => {
  try {
    revalidateTag(ALL_CACHE_KEY);
    return true;
  } catch (error) {
    console.error("resetNextCache failed:", error);
    return false;
  }
};

/* ---------------------------------------
   Reset ONLY CloudFront cache
---------------------------------------- */
export const resetCloudfrontCache = async (): Promise<boolean> => {
  try {
    const result = await cloudfront.cache.clear(["/*"]);
    return Boolean(result);
  } catch (error: any) {
    console.warn("resetCloudfrontCache non-blocking fallback:", error?.message || error);
    return true; // Non-blocking graceful fallback
  }
};
