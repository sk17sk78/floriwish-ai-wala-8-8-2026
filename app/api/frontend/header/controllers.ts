// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { HeaderNavLinks } = models;

// Redis
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { HEADER_CACHE_KEY } from "@/common/constants/cacheKeys";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

// In-memory L1 cache
let inMemoryHeaderCache: { data: HeaderNavLinkDocument[]; timestamp: number } | null = null;
const L1_TTL_MS = 120 * 1000; // 120 seconds

// controllers
export const getNavLinks = async (): Promise<HeaderNavLinkDocument[] | null> => {
  try {
    const now = Date.now();

    // 1. In-Memory L1 Cache (<1ms)
    if (inMemoryHeaderCache && now - inMemoryHeaderCache.timestamp < L1_TTL_MS) {
      return inMemoryHeaderCache.data;
    }

    // 2. Redis L2 Cache (~5-15ms)
    try {
      const cached = await getFromRedis<HeaderNavLinkDocument[]>({ key: HEADER_CACHE_KEY });
      if (cached && cached.length > 0) {
        inMemoryHeaderCache = { data: cached, timestamp: now };
        return cached;
      }
    } catch {}

    // 3. MongoDB
    await connectDB();

    const documents = await HeaderNavLinks.find({ isActive: true })
      .select(["label", "path", "sections", "quickLinks"])
      .populate([
        {
          path: "quickLinks.image",
          select: ["alt", "defaultAlt", "url"],
          strictPopulate: false
        },
        {
          path: "sections.links.tag",
          select: ["name"],
          populate: [{ path: "color", select: ["hexCode"] }],
          strictPopulate: false
        }
      ])
      .sort({ order: 1 })
      .lean()
      .exec();

    if (!documents) return null;

    const result = JSON.parse(JSON.stringify(documents)) as unknown as HeaderNavLinkDocument[];
    inMemoryHeaderCache = { data: result, timestamp: now };

    try {
      await setToRedis({ key: HEADER_CACHE_KEY, value: result });
    } catch {}

    return result;
  } catch (error: any) {
    return null;
  }
};

