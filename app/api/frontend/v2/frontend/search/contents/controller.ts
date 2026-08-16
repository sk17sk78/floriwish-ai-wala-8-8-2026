import models from "@/db/mongoose/models";
import connectDB from "@/db/mongoose/connection";
import { handleError } from "@/common/utils/api/error";
import { MongooseErrorType } from "@/common/types/apiTypes";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import mongoose from "mongoose";

const { Contents } = models;

export const SEARCH_CATALOG_CACHE_KEY = "search_active_products_catalog";

export const getSearchableCatalogFromDB = async (): Promise<any[]> => {
  await connectDB();

  const contents = await Contents.aggregate([
    { $match: { isActive: true } },
    {
      $project: {
        type: 1,
        name: 1,
        slug: 1,
        redirectFrom: 1,
        "seoMeta.title": 1,
        "seoMeta.keywords": 1,
        "media.primary": 1,
        "quality.rating": 1,
        "price.base": 1,
        "price.cities": 1,
        "delivery.processingTime": 1,
        "tag.promotionTag": 1,
        edible: 1
      }
    },
    {
      $lookup: {
        from: "images",
        localField: "media.primary",
        foreignField: "_id",
        as: "media.primary",
        pipeline: [
          {
            $project: {
              url: 1,
              _id: 0
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$media.primary",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "processingtimes",
        localField: "delivery.processingTime",
        foreignField: "_id",
        as: "delivery.processingTime"
      }
    },
    {
      $unwind: {
        path: "$delivery.processingTime",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "promotiontags",
        localField: "tag.promotionTag",
        foreignField: "_id",
        as: "tagInfo",
        pipeline: [
          {
            $lookup: {
              from: "colors",
              localField: "color",
              foreignField: "_id",
              as: "color",
              pipeline: [{ $project: { hexCode: 1, _id: 0 } }]
            }
          },
          {
            $unwind: {
              path: "$color",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              name: 1,
              color: "$color.hexCode",
              _id: 0
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$tagInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        type: 1,
        name: 1,
        slug: 1,
        redirectFrom: 1,
        seoTitle: "$seoMeta.title",
        seoKeywords: "$seoMeta.keywords",
        image: "$media.primary.url",
        rating: "$quality.rating.value",
        ratingCount: "$quality.rating.count",
        baseMrp: "$price.base.mrp",
        basePrice: "$price.base.price",
        citiesPrice: "$price.cities",
        procTime: "$delivery.processingTime.hours",
        tagInfo: 1,
        edible: 1
      }
    }
  ]);

  return contents || [];
};

export const getSearchableCatalog = async (): Promise<any[]> => {
  try {
    const cached = await getFromRedis<any[]>({ key: SEARCH_CATALOG_CACHE_KEY });
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch {}

  const catalog = await getSearchableCatalogFromDB();
  if (catalog && catalog.length > 0) {
    const parsed = JSON.parse(JSON.stringify(catalog));
    await setToRedis({ key: SEARCH_CATALOG_CACHE_KEY, value: parsed });
    return parsed;
  }

  return [];
};

export const getContents = async ({
  cityId,
  key,
  limit = 40
}: {
  cityId: string | null;
  key?: string | null;
  limit?: number;
}): Promise<object[] | null> => {
  try {
    const catalog = await getSearchableCatalog();
    if (!catalog || catalog.length === 0) {
      return [];
    }

    let filtered = catalog;

    if (key && key.trim().length > 0) {
      const cleanKey = key.trim().toLowerCase().replace(/-/g, " ");
      const terms = cleanKey.split(/\s+/).filter(Boolean);

      filtered = catalog.filter((item) => {
        const searchableText = [
          item.name,
          item.slug,
          item.redirectFrom,
          item.seoTitle,
          item.seoKeywords,
          item.tagInfo?.name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return terms.every((term) => searchableText.includes(term));
      });
    }

    const sliced = filtered.slice(0, limit);

    return sliced.map((item) => {
      let finalPrice = item.basePrice;
      if (cityId && Array.isArray(item.citiesPrice)) {
        const cityObj = item.citiesPrice.find(
          (c: any) => String(c.city) === String(cityId)
        );
        if (cityObj && typeof cityObj.price === "number") {
          finalPrice = cityObj.price;
        }
      }

      return {
        name: item.name,
        slug: `${item.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${item.slug}`,
        price: finalPrice,
        basePrice: item.basePrice,
        mrp: item.baseMrp,
        image: item.image,
        rating: item.rating,
        ratingCount: item.ratingCount,
        procTime: item.procTime,
        tagInfo: item.tagInfo?.name ? item.tagInfo : undefined,
        edible: item.edible
          ? [item.edible.isEdible, item.edible.type || "unspecified"]
          : undefined
      };
    });
  } catch (error: any) {
    return [];
  }
};
