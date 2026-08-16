// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Catalogues, CatalogueCategories } = models;

// Redis
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { CATALOGUE_CATEGORIES_CACHE_KEY } from "@/common/constants/cacheKeys";

// types
import { type CatalogueCategoryDocument } from "@/common/types/documentation/categories/catalogueCategory";
import { type CatalogueDocument } from "@/common/types/documentation/presets/catalogue";

// In-memory L1 cache
let inMemoryCatalogueCache: { data: CatalogueCategoryDocument[]; timestamp: number } | null = null;
const L1_TTL_MS = 120 * 1000; // 120 seconds

export const getCatalogueCategories = async (): Promise<CatalogueCategoryDocument[] | null> => {
  try {
    const now = Date.now();

    // 1. In-Memory L1 Cache (<1ms)
    if (inMemoryCatalogueCache && now - inMemoryCatalogueCache.timestamp < L1_TTL_MS) {
      return inMemoryCatalogueCache.data;
    }

    // 2. Redis L2 Cache (~5-15ms)
    try {
      const cached = await getFromRedis<CatalogueCategoryDocument[]>({ key: CATALOGUE_CATEGORIES_CACHE_KEY });
      if (cached && cached.length > 0) {
        inMemoryCatalogueCache = { data: cached, timestamp: now };
        return cached;
      }
    } catch {}

    // 3. MongoDB — run both queries in parallel
    await connectDB();

    const [catalogueCategories, catalogues] = await Promise.all([
      CatalogueCategories.find({ isActive: true })
        .select(["name", "title", "icon"])
        .populate([{ path: "icon", select: ["alt", "url"] }])
        .lean(),
      Catalogues.find({ isActive: true })
        .select(["category", "name", "path"])
        .populate([{ path: "icon", select: ["alt", "url"] }])
        .lean()
    ]);

    if (!catalogueCategories || !catalogues) return null;

    const catalogueCategoriesMap = new Map<string, CatalogueDocument[]>();

    for (let i = 0; i < catalogues.length; i++) {
      const catalogue = catalogues[i] as unknown as CatalogueDocument;
      const key = catalogue.category.toString();
      catalogueCategoriesMap.set(key, [
        ...(catalogueCategoriesMap.get(key) || []),
        catalogue
      ]);
    }

    const catalogueCategoryResults = (catalogueCategories as unknown as CatalogueCategoryDocument[]).map(
      (catalogueCategoryObject) => {
        (catalogueCategoryObject as any)._catalogues =
          catalogueCategoriesMap.get(String((catalogueCategoryObject as any)._id)) || [];
        return catalogueCategoryObject;
      }
    );

    inMemoryCatalogueCache = { data: catalogueCategoryResults, timestamp: now };

    try {
      await setToRedis({ key: CATALOGUE_CATEGORIES_CACHE_KEY, value: catalogueCategoryResults });
    } catch {}

    return catalogueCategoryResults;
  } catch (error: any) {
    return null;
  }
};

