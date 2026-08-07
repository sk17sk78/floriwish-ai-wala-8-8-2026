// libraries
import { cloudfront } from "@/lib/aws";
import { revalidateTag } from "next/cache";
import { del as clearRedis } from "@/db/redis/methods";

// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Contents } = models;

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type MongooseErrorType } from "@/common/types/apiTypes";
import { type RevalidateCache } from "@/common/types/revalidateCache";

export const clearCache = async ({
  redisKeys,
  nextTags,
  cloudfrontPath
}: {
  redisKeys: string[];
  nextTags: string[];
  cloudfrontPath?: string;
}): Promise<RevalidateCache> => {
  try {
    // Clear Redis cache
    const isRedisCleared = await clearRedis({ keys: redisKeys });

    // Revalidate Next.js cache tags
    nextTags.forEach((tag) => {
      revalidateTag(tag);
    });

    // Clear CloudFront cache (non-blocking, graceful failure)
    let isCloudfrontCleared = false;
    
    if (cloudfrontPath) {
      try {
        const response = await cloudfront.cache.clear([cloudfrontPath]);
        isCloudfrontCleared = !!response;
        
        if (isCloudfrontCleared) {
        } else {
        }
      } catch (error: any) {
        // Log but don't fail the entire operation
        isCloudfrontCleared = false;
      }
    }

    return {
      redis: isRedisCleared,
      next: true,
      cloudfront: isCloudfrontCleared
    };
  } catch (error) {
    return {
      redis: false,
      next: false,
      cloudfront: false
    };
  }
};

export const getReferenceVariantSlugs = async ({
  slug
}: {
  slug: string;
}): Promise<string[]> => {
  try {
    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select(["variants.type", "variants.reference.reference"])
      .populate([
        {
          path: "variants.reference.reference",
          select: ["slug"],
          strictPopulate: false
        }
      ]);

    if (!document) {
      return [];
    }

    const referenceVariantSlugs =
      document.variants?.flatMap((variantCategory) => {
        if (variantCategory.type === "reference") {
          return (
            variantCategory.reference?.map(
              ({ reference }) => (reference as ContentDocument).slug
            ) || []
          );
        } else {
          return [] as string[];
        }
      }) || [];

    return referenceVariantSlugs;
  } catch (error: any) {
    return [];
  }
};
