import models from "@/db/mongoose/models";
import connectDB from "@/db/mongoose/connection";
import { handleError } from "@/common/utils/api/error";
import { MongooseErrorType } from "@/common/types/apiTypes";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import mongoose from "mongoose";

const { Contents } = models;

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
    await connectDB();

    /* const contents = await Contents.find({ isActive: true })
      .lean()
      .select([
        "type",
        "name",
        "slug",
        "media.primary",
        "quality.rating.value",
        "edible"
      ])
      .populate([
        {
          path: "media.primary",
          select: "url"
        }
      ])
      .exec(); */

    const id = cityId !== null ? new mongoose.Types.ObjectId(cityId) : null;

    const priceFilterQuery =
      id === null
        ? {
            basePrice: "$price.base.price"
          }
        : {
            basePrice: "$price.base.price",
            price: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$price.cities",
                    as: "cityObj",
                    cond: {
                      $eq: ["$$cityObj.city", id]
                    }
                  }
                },
                0
              ]
            }
          };

    const matchQuery: any = { isActive: true };
    if (key && key.trim().length > 0) {
      const cleanKey = key.trim().replace(/-/g, " ");
      const terms = cleanKey.split(/\s+/).filter(Boolean);
      const termRegexes = terms.map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));

      matchQuery.$and = termRegexes.map((r) => ({
        $or: [
          { name: r },
          { slug: r },
          { redirectFrom: r },
          { "seoMeta.title": r },
          { "seoMeta.keywords": r },
          { "tag.aiTags": r }
        ]
      }));
    }

    const contents = await Contents.aggregate([
      { $match: matchQuery },
      { $limit: limit }, // Performance optimization: limit results as early as possible
      {
        $project: {
          type: 1,
          name: 1,
          slug: 1,
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
          image: "$media.primary.url",
          rating: "$quality.rating.value",
          ratingCount: "$quality.rating.count",
          mrp: "$price.base.mrp",
          procTime: "$delivery.processingTime.hours",
          tagInfo: 1,
          edible: 1,
          ...priceFilterQuery
        }
      }
    ]);

    if (!contents || contents.length === 0) {
      return null;
    }

    return contents.map(
      ({ type, name, slug, image, rating, ratingCount, mrp, procTime, tagInfo, edible, price, basePrice }) => ({
        name,
        slug: `${type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${slug}`,
        price: typeof price === "object" ? price.price : price,
        basePrice,
        mrp,
        // @ts-ignore
        image,
        rating,
        ratingCount,
        procTime,
        tagInfo: tagInfo?.name ? tagInfo : undefined,
        edible: edible
          ? [edible.isEdible, edible.type || "unspecified"]
          : undefined
      })
    );
  } catch (error: any) {
    return null;
  }
};
