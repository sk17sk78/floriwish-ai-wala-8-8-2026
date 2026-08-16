// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { HomepageLayouts } = models;

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// constants
import { HOMEPAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { type MongooseErrorType } from "@/common/types/apiTypes";

// constants
const SELECT = {
  content: [
    "type",
    "name",
    "slug",
    "media.primary",
    "delivery",
    "quality.rating.value",
    "quality.rating.count",
    "price",
    "edible",
  ],
  image: ["alt", "defaultAlt", "url"],
};

const POPULATE = {
  content: [
    {
      path: "media.primary",
      select: SELECT.image,
    },
    {
      path: "tag.promotionTag",
      select: ["name"],
      populate: [
        {
          path: "color",
          select: ["hexCode"],
        },
      ],
      strictPopulate: false,
    },
    {
      path: "delivery.processingTime",
      select: ["hours"],
    },
    {
      path: "delivery.slots.type",
      select: ["name", "price", "timeSlots"],
    },
  ],
};

// In-memory L1 cache
let inMemoryHomepageCache: { data: HomepageLayoutDocument[]; timestamp: number } | null = null;
const L1_TTL_MS = 60 * 1000; // 60 seconds

// controllers
export const getHomepageLayoutsFromDB = async (): Promise<
  HomepageLayoutDocument[] | null
> => {
  try {
    await connectDB();

    const documents = await HomepageLayouts.find({
      isActive: true,
    })
      .select([
        "type",
        "title",
        "subtitle",
        "layout",
        "leftAlign",
        "extraSpacing",
        "scrollable",
        "customBG",
        "order",
      ])
      .populate([
        {
          path: "layout.banner.images.desktop",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.banner.images.mobile",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.collage.images.image",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.content",
          select: SELECT.content,
          populate: POPULATE.content,
          strictPopulate: false,
        },
        {
          path: "layout.category.images.image",
          select: SELECT.image,
          strictPopulate: false,
        },
      ])
      .sort({
        order: 1,
      })
      .lean()
      .exec();

    if (!documents || documents.length === 0) {
      return null;
    }

    return documents as unknown as HomepageLayoutDocument[];
  } catch (error: any) {
    return null;
  }
};

export const getHomepageLayouts = async (): Promise<
  HomepageLayoutDocument[] | null
> => {
  try {
    // 1. In-Memory L1 Cache (ultra-fast <1ms response)
    const now = Date.now();
    if (inMemoryHomepageCache && (now - inMemoryHomepageCache.timestamp) < L1_TTL_MS) {
      return inMemoryHomepageCache.data;
    }

    // 2. Try Redis cache (L2)
    const cachedDocuments = await getFromRedis<HomepageLayoutDocument[]>({
      key: HOMEPAGE_CACHE_KEY,
    });

    if (cachedDocuments && Array.isArray(cachedDocuments) && cachedDocuments.length > 0) {
      inMemoryHomepageCache = { data: cachedDocuments, timestamp: now };
      return cachedDocuments;
    }

    // 3. Fetch from MongoDB on cache miss
    const parsedDocuments = await getHomepageLayoutsFromDB();
    if (!parsedDocuments) {
      return null;
    }

    // 4. Cache into Redis and Memory L1
    inMemoryHomepageCache = { data: parsedDocuments, timestamp: now };
    await setToRedis({
      key: HOMEPAGE_CACHE_KEY,
      value: parsedDocuments,
    });

    return parsedDocuments;
  } catch (error: any) {
    return null;
  }
};


