// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { FooterSections } = models;

// Redis
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { FOOTER_CACHE_KEY } from "@/common/constants/cacheKeys";

// types
import { type FooterSectionDocument } from "@/common/types/documentation/pages/footerSection";

// In-memory L1 cache
let inMemoryFooterCache: { data: FooterSectionDocument[]; timestamp: number } | null = null;
const L1_TTL_MS = 120 * 1000; // 120 seconds

// controllers
export const getFooterSections = async (): Promise<FooterSectionDocument[] | null> => {
  try {
    const now = Date.now();

    // 1. In-Memory L1 Cache (<1ms)
    if (inMemoryFooterCache && now - inMemoryFooterCache.timestamp < L1_TTL_MS) {
      return inMemoryFooterCache.data;
    }

    // 2. Redis L2 Cache (~5-15ms)
    try {
      const cached = await getFromRedis<FooterSectionDocument[]>({ key: FOOTER_CACHE_KEY });
      if (cached && cached.length > 0) {
        inMemoryFooterCache = { data: cached, timestamp: now };
        return cached;
      }
    } catch {}

    // 3. MongoDB
    await connectDB();

    const documents = await FooterSections.find({ isActive: true })
      .select(["heading", "path", "links"])
      .sort({ order: 1 })
      .lean()
      .exec();

    if (!documents) return null;

    const result = documents as unknown as FooterSectionDocument[];
    inMemoryFooterCache = { data: result, timestamp: now };

    try {
      await setToRedis({ key: FOOTER_CACHE_KEY, value: result });
    } catch {}

    return result;
  } catch (error: any) {
    return null;
  }
};

