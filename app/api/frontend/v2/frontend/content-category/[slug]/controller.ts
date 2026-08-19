// DB connection
import connectDB from "@/db/mongoose/connection";
import mongoose from "mongoose";

// models
import models from "@/db/mongoose/models";
const { ContentCategories, Contents } = models;

// libraries
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";

// constants
import { CONTENT_CATEGORY_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

// utils
import { transformProductToListItem } from "@/common/utils/product/transformProduct";
import { resolveActiveGlobalCategoryBanner } from "@/common/utils/category/resolveCategoryBanner";

export const getCategoryData = async (slug: string) => {
  const cacheKey = `${CONTENT_CATEGORY_PAGE_CACHE_KEY}_v4_${slug}`;
  const cachedDocument = await getFromRedis<any>({
    key: cacheKey
  });

  if (cachedDocument) {
    return cachedDocument;
  }

  await connectDB();

  const LIMIT = 32;

  const trimmedSlug = (slug || "").trim();
  const [categoryRes, globalBanner] = await Promise.all([
    ContentCategories.aggregate([
    {
      $match: {
        isActive: true,
        $or: [
          { slug: slug },
          { slug: trimmedSlug },
          { slug: new RegExp(`^${trimmedSlug}\\s*$`, "i") }
        ]
      }
    },
    // Lookup all images needed for this category in one go
    {
      $lookup: {
        from: "images",
        let: { 
            iconId: "$media.icon", 
            bannerDesktopIds: { $ifNull: ["$media.banner.images.desktop", []] },
            bannerMobileIds: { $ifNull: ["$media.banner.images.mobile", []] },
            quickLinkImageIds: { $ifNull: ["$media.quickLinks.image", []] }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$_id", "$$iconId"] },
                  { $in: ["$_id", "$$bannerDesktopIds"] },
                  { $in: ["$_id", "$$bannerMobileIds"] },
                  { $in: ["$_id", "$$quickLinkImageIds"] }
                ]
              }
            }
          },
          { $project: { alt: 1, defaultAlt: 1, url: 1, _id: 1 } }
        ],
        as: "allImages"
      }
    },
    // Lookup related categories
    {
        $lookup: {
          from: "contentcategories",
          localField: "relatedCategories.categories",
          foreignField: "_id",
          as: "relatedCategoriesData",
          pipeline: [
            { $project: { slug: 1, _id: 1, name: 1, "media.icon": 1 } },
            {
              $lookup: {
                from: "images",
                localField: "media.icon",
                foreignField: "_id",
                as: "icon",
                pipeline: [{ $project: { alt: 1, defaultAlt: 1, url: 1, _id: 0 } }]
              }
            },
            { $unwind: { path: "$icon", preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ]),
    resolveActiveGlobalCategoryBanner(slug)
  ]);

  if (!categoryRes || categoryRes.length === 0) {
    return null;
  }

  const rawCategory = categoryRes[0];
  const allImages = rawCategory.allImages || [];

  // Helper to find image in the pre-fetched array
  const findImage = (id: any) => {
    if (!id) return null;
    return allImages.find((img: any) => String(img._id) === String(id)) || null;
  };

  // Build the structured category object (prioritizing active global banner over original category banner)
  const categoryResult: any = {
    _id: rawCategory._id,
    name: rawCategory.name,
    slug: rawCategory.slug,
    media: {
      ...rawCategory.media,
      icon: findImage(rawCategory.media?.icon),
      banner: globalBanner || {
        ...rawCategory.media?.banner,
        images: (Array.isArray(rawCategory.media?.banner?.images) 
            ? rawCategory.media.banner.images 
            : rawCategory.media?.banner?.images ? [rawCategory.media.banner.images] : []
        ).map((img: any) => ({
            desktop: findImage(img.desktop),
            mobile: findImage(img.mobile)
        }))
      },
      quickLinks: (rawCategory.media?.quickLinks || []).map((ql: any) => ({
        label: ql.label,
        path: ql.path,
        image: findImage(ql.image)
      })),
      scrollableQuickLinks: !!rawCategory.media?.scrollableQuickLinks
    },
    info: rawCategory.info,
    charges: rawCategory.charges,
    seo: {
        faqs: rawCategory.seo?.faqs || []
    },
    personalizedReviews: rawCategory.personalizedReviews || [],
    relatedCategories: {
        show: rawCategory.relatedCategories?.show || false,
        categories: rawCategory.relatedCategoriesData || []
    }
  };

  const categoryId = rawCategory._id;

  // 2. FETCH PRODUCTS DATA
  const productsData = await Contents.aggregate([
    {
      $match: {
        isActive: true,
        $or: [
          { "category.primary": new mongoose.Types.ObjectId(categoryId) },
          { "category.related": new mongoose.Types.ObjectId(categoryId) }
        ]
      }
    },
    {
      $facet: {
        totalCount: [{ $count: "total" }],
        avgReviews: [
          {
            $group: {
              _id: null,
              totalWeightedRating: { 
                $sum: { 
                  $multiply: [
                    { $ifNull: ["$quality.rating.value", 0] }, 
                    { $ifNull: ["$quality.rating.count", 0] }
                  ] 
                } 
              },
              totalRatingCount: { $sum: { $ifNull: ["$quality.rating.count", 0] } }
            }
          }
        ],
        contents: [
          { $sort: { "quality.rating.count": -1 } },
          { $limit: LIMIT },
          {
            $lookup: {
              from: "images",
              localField: "media.primary",
              foreignField: "_id",
              as: "primaryImageData",
              pipeline: [{ $project: { alt: 1, defaultAlt: 1, url: 1, _id: 0 } }]
            }
          },
          {
            $lookup: {
                from: "promotiontags",
                localField: "tag.promotionTag",
                foreignField: "_id",
                as: "promoTagData",
                pipeline: [
                  {
                    $lookup: {
                      from: "colors",
                      localField: "color",
                      foreignField: "_id",
                      as: "colorData",
                      pipeline: [{ $project: { hexCode: 1, _id: 0 } }]
                    }
                  },
                  { $unwind: { path: "$colorData", preserveNullAndEmptyArrays: true } },
                  { $project: { name: 1, color: "$colorData", _id: 0 } }
                ]
              }
          },
          {
            $lookup: {
              from: "processingtimes",
              localField: "delivery.processingTime",
              foreignField: "_id",
              as: "procTimeData",
              pipeline: [{ $project: { hours: 1, _id: 0 } }]
            }
          },
          {
            $lookup: {
              from: "deliverytypes",
              localField: "delivery.slots.type",
              foreignField: "_id",
              as: "slotTypesData",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    timeSlots: { $ifNull: ["$timeSlots", []] }
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 1,
              type: 1,
              name: 1,
              slug: 1,
              sku: 1,
              media: {
                primary: { $arrayElemAt: ["$primaryImageData", 0] }
              },
              isBestSeller: 1,
              tag: {
                promotionTag: { $arrayElemAt: ["$promoTagData", 0] }
              },
              quality: {
                rating: {
                  value: "$quality.rating.value",
                  count: "$quality.rating.count"
                }
              },
              delivery: {
                processingTime: { $arrayElemAt: ["$procTimeData", 0] },
                slots: {
                  $map: {
                    input: { $ifNull: ["$delivery.slots", []] },
                    as: "slot",
                    in: {
                      type: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$slotTypesData",
                              as: "st",
                              cond: { $eq: ["$$st._id", "$$slot.type"] }
                            }
                          },
                          0
                        ]
                      },
                      timeSlots: "$$slot.timeSlots"
                    }
                  }
                }
              },
              price: {
                mrp: "$price.base.mrp",
                price: "$price.base.price"
              },
              edible: 1,
              updatedAt: 1
            }
          }
        ]
      }
    }
  ]);

  const facetResult = productsData[0];
  const totalCount = facetResult.totalCount[0]?.total || 0;
  const avgReviews = facetResult.avgReviews[0] || { totalWeightedRating: 0, totalRatingCount: 0 };

  categoryResult._page = {
    contentCount: totalCount,
    averageRating:
      avgReviews.totalRatingCount > 0
        ? avgReviews.totalWeightedRating / avgReviews.totalRatingCount
        : 0,
    ratingCount: avgReviews.totalRatingCount,
    contents: (facetResult.contents || []).map(transformProductToListItem)
  };

  const finalResult = JSON.parse(JSON.stringify(categoryResult));

  await setToRedis({
    key: cacheKey,
    value: finalResult
  });

  return finalResult;
};
