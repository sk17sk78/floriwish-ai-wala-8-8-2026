// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Settings } = models;

// Redis
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { SETTING_CACHE_KEY } from "@/common/constants/cacheKeys";

// types
import { type SettingDocument } from "@/common/types/documentation/settings/setting";

// In-memory L1 cache
let inMemorySettingCache: { data: SettingDocument; timestamp: number } | null = null;
const L1_TTL_MS = 60 * 1000; // 60 seconds

// controllers
export const getSetting = async (): Promise<SettingDocument | null> => {
  try {
    const now = Date.now();
    // 1. In-Memory L1 Cache (<1ms)
    if (inMemorySettingCache && (now - inMemorySettingCache.timestamp) < L1_TTL_MS) {
      return inMemorySettingCache.data;
    }

    // 2. Redis L2 Cache (~10ms)
    try {
      const cached = await getFromRedis<SettingDocument>({ key: SETTING_CACHE_KEY });
      if (cached) {
        inMemorySettingCache = { data: cached, timestamp: now };
        return cached;
      }
    } catch {}

    // 3. MongoDB with .lean()
    await connectDB();
    const document = await Settings.findOne().lean();

    if (!document) {
      return null;
    }

    const typedDoc = document as unknown as SettingDocument;
    inMemorySettingCache = { data: typedDoc, timestamp: now };

    try {
      await setToRedis({ key: SETTING_CACHE_KEY, value: typedDoc });
    } catch {}

    return typedDoc;
  } catch (error: any) {
    return null;
  }
};
