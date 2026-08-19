// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Cities } = models;

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type MongooseErrorType } from "@/common/types/apiTypes";

// In-memory L1 cache
let inMemoryLocationCache: { data: CityDocument[]; timestamp: number } | null = null;
const L1_TTL_MS = 120 * 1000; // 120 seconds

// controllers
export const getCities = async (): Promise<CityDocument[] | null> => {
  try {
    const now = Date.now();
    if (inMemoryLocationCache && (now - inMemoryLocationCache.timestamp) < L1_TTL_MS) {
      return inMemoryLocationCache.data;
    }

    await connectDB();

    const documents = await Cities.find({
      isActive: true,
      isDeleted: { $ne: true }
    })
      .select(["name", "aliases"])
      .sort({ name: 1 })
      .lean()
      .exec();

    const result = JSON.parse(JSON.stringify(documents || [])) as unknown as CityDocument[];
    inMemoryLocationCache = { data: result, timestamp: now };
    return result;
  } catch (error: any) {
    return null;
  }
};
