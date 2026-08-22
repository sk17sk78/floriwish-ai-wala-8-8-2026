// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { Contents, Coupons, Vendors } = models;

// utils
import { handleError } from "@/common/utils/api/error";
import { get as getFromRedis, set as setToRedis } from "@/db/redis/methods";
import { CONTENT_PAGE_CACHE_KEY } from "@/common/constants/cacheKeys";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentSuggestionDocument } from "@/common/types/documentation/nestedDocuments/contentSuggestion";
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";
import { type MongooseErrorType } from "@/common/types/apiTypes";

// constants
const SELECT = {
  contentBasic: [
    "name",
    "slug",
    // "category",
    "media.video",
    "availability.availableAt",
    "availability.limitAvailability",
    "detail.includes",
    "detail.excludes",
    "quality.rating.maxValue",
    "quality.rating.value",
    "quality.rating.count",
    "quality.review.personalized",
    "quality.review.count",
    "delivery.charge",
    "delivery.slots.timeSlots",
    "delivery.slots.price",
    "price.base.mrp",
    "price.base.price",
    "price.cities.city",
    "price.cities.mrp",
    "price.cities.price",
    "edible.isEdible",
    "edible.type",
    "seoMeta.title",
    "seoMeta.tags",
    "seoMeta.description"
  ],
  contentSuggestion: [
    "type",
    "name",
    "slug",
    "media.primary",
    "quality.rating.value",
    "quality.rating.count",
    "delivery.slots.timeSlots",
    "price.base.mrp",
    "price.base.price",
    "price.cities.city",
    "price.cities.mrp",
    "price.cities.price",
    "edible.isEdible",
    "edible.type"
  ],
  image: ["alt", "defaultAlt", "url"]
};

const POPULATE = {
  contentBasic: [
    {
      path: "category.primary",
      select: ["name", "slug", "charges"],
      populate: [
        {
          path: "charges.advancePayment",
          select: ["value"]
        }
      ]
    },
    {
      path: "media.primary",
      select: SELECT.image
    },
    {
      path: "media.gallery",
      select: SELECT.image
    },
    {
      path: "media.review",
      select: SELECT.image
    },
    {
      path: "tag.promotionTag",
      select: ["name"],
      populate: [
        {
          path: "color",
          select: ["hexCode"]
        }
      ],
      strictPopulate: false
    },
    {
      path: "detail.deliveryDetail",
      select: ["content"]
    },
    {
      path: "detail.careInfo",
      select: ["content"]
    },
    {
      path: "detail.cancellationPolicy",
      select: ["content"]
    },
    {
      path: "detail.faqGroup",
      select: ["faqs._id", "faqs.question", "faqs.answer"]
    },
    {
      path: "quality.review.group",
      select: ["reviews"],
      strictPopulate: false
    },
    {
      path: "delivery.processingTime",
      select: ["hours"]
    },
    {
      path: "delivery.slots.type",
      select: [
        "name",
        "price",
        "timeSlots._id",
        "timeSlots.label",
        "timeSlots.startTime",
        "timeSlots.endTime"
      ]
    }
  ],
  contentCustomization: [
    {
      path: "customization.enhancement.label",
      select: ["label"]
    },
    {
      path: "customization.enhancement.items.enhancement",
      select: ["label"],
      populate: [
        {
          path: "image",
          select: SELECT.image
        }
      ]
    },
    {
      path: "customization.upgrade.label",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.upgrade.default",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.upgrade.options.upgrade",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.flavour.label",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.flavour.default",
      select: ["name"],
      strictPopulate: false
    },
    {
      path: "customization.flavour.options.flavour",
      select: ["name"],
      strictPopulate: false
    },
    {
      path: "customization.balloonColor.label",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.balloonColor.groups",
      select: ["name", "colors"],
      strictPopulate: false
    },
    {
      path: "customization.uploadText.label",
      select: ["label"],
      strictPopulate: false
    },
    {
      path: "customization.uploadImage.label",
      select: ["label"],
      strictPopulate: false
    }
  ],
  contentSuggestion: [
    {
      path: "media.primary",
      select: SELECT.image
    },
    {
      path: "tag.promotionTag",
      select: ["name"],
      populate: [
        {
          path: "color",
          select: ["hexCode"]
        }
      ],
      strictPopulate: false
    },
    {
      path: "delivery.processingTime",
      select: ["hours"]
    },
    {
      path: "delivery.slots.type",
      select: [
        // "name",
        // "price",
        "timeSlots._id",
        // "timeSlots.label",
        "timeSlots.startTime",
        "timeSlots.endTime"
      ]
    }
  ],
  addon: [
    {
      path: "addons.addon",
      select: [
        "category",
        "name",
        "price",
        "image",
        "edible.isEdible",
        "edible.type"
      ],
      populate: [
        {
          path: "category",
          select: ["name"]
        },
        {
          path: "image",
          select: SELECT.image
        }
      ]
    }
  ]
};

// utils
const getRandomElements = <T>({
  array,
  count
}: {
  array: T[];
  count: number;
}): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

// controllers
export const getMeta = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  const cacheKey = `content_page_meta_${slug}`;
  try {
    const cached = await getFromRedis<ContentDocument>({ key: cacheKey });
    if (cached) return cached;

    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select(["seoMeta"])
      .populate([
        {
          path: "media.primary",
          select: ["url"]
        },
        {
          path: "media.gallery",
          select: ["url"]
        }
      ]);

    if (!document) {
      return null;
    }

    const parsed = JSON.parse(JSON.stringify(document));
    await setToRedis({ key: cacheKey, value: parsed });
    return parsed;
  } catch (error: any) {
    return null;
  }
};

export const getContentPageDetailsI = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  try {
    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select([...SELECT.contentBasic, "createdAt"])
      .populate(POPULATE.contentBasic);

    if (!document) {
      return null;
    }

    return document;
  } catch (error: any) {
    console.error(`❌ DB Error in getContentPageDetailsI for ${slug}:`, error);
    return null;
  }
};

export const getContentPageDetailsII = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  try {
    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    }).select(["availability", "price"]);

    if (!document) {
      return null;
    }

    if (
      document?.availability?.availableAt === "cities" &&
      document?.availability?.limitAvailability
    ) {
      if (document?.price?.cities?.length) {
        document.availability.cities = document.price.cities.map(
          ({ city }) => city as string
        );
      } else {
        document.availability.cities = [];
      }
    }

    return document;
  } catch (error: any) {
    console.error(`❌ DB Error in getContentPageDetailsII for ${slug}:`, error);
    return null;
  }
};

export const getContentPageDetailsIII = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  try {
    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select([
        "customization.isCustomizable",
        "customization.enhancement.items._id",
        "customization.enhancement.items.price",
        "customization.upgrade.options._id",
        "customization.upgrade.options.price",
        "customization.flavour.options._id",
        "customization.flavour.options.price",
        "customization.uploadText.characterLimit",
        "customization.uploadImage.imageLimit",
        "addons.isPopular"
      ])
      .populate([...POPULATE.contentCustomization, ...POPULATE.addon]);

    if (!document) {
      return null;
    }

    const documentObj = document.toObject() as unknown as ContentDocument;

    documentObj.customization = documentObj.customization;
    documentObj.addons = documentObj.addons;

    return documentObj;
  } catch (error: any) {
    console.error(`❌ DB Error in getContentPageDetailsIII for ${slug}:`, error);
    return null;
  }
};

export const getContentPageDetailsIV = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  try {
    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select(["variants"])
      .populate([
        {
          path: "variants.label",
          select: ["label"]
        },
        {
          path: "variants.reference.reference",
          select: [
            "name",
            "slug",
            "price.base.mrp",
            "price.base.price",
            "price.cities.city",
            "price.cities.mrp",
            "price.cities.price"
          ],
          populate: [
            {
              path: "media.primary",
              select: SELECT.image
            }
          ],
          strictPopulate: false
        },
        {
          path: "variants.custom.unit",
          select: ["name", "abbr", "serves"],
          strictPopulate: false
        },
        {
          path: "variants.custom.variants",
          select: ["label", "price", "value"],
          populate: [
            {
              path: "image",
              select: SELECT.image
            }
          ],
          strictPopulate: false
        }
      ]);

    if (!document) {
      return null;
    }

    return document;
  } catch (error: any) {
    console.error(`❌ DB Error in getContentPageDetailsIV for ${slug}:`, error);
    return null;
  }
};

export const getCoupons = async ({
  categoryId
}: {
  categoryId: string;
}): Promise<CouponDocument[]> => {
  try {
    await connectDB();

    const coupons = await Coupons.find({
      isActive: true,
      $or: [
        { applicableCategories: { $size: 0 } },
        { applicableCategories: categoryId }
      ]
    })
      .select([
        "type",
        "code",
        "description",
        "minimumOrderAmount",
        "valid",
        "limitPerCustomer",
        "discount.type",
        "discount.limit",
        "discount.percentage"
      ])
      .limit(10);

    return coupons;
  } catch (error: any) {
    return [];
  }
};

// In-memory L1 cache for suggestions
const inMemorySuggestionsCache = new Map<string, { data: ContentDocument; timestamp: number }>();
const SUGGESTIONS_L1_TTL_MS = 120 * 1000; // 120 seconds

export const getContentPageDetailsV = async ({
  slug
}: {
  slug: string;
}): Promise<ContentDocument | null> => {
  const cacheKey = `${CONTENT_PAGE_CACHE_KEY}_suggestions_${slug}`;
  const now = Date.now();

  try {
    // 1. In-Memory L1 Cache (<1ms)
    const l1 = inMemorySuggestionsCache.get(cacheKey);
    if (l1 && (now - l1.timestamp) < SUGGESTIONS_L1_TTL_MS) {
      return l1.data;
    }

    // 2. Redis L2 Cache
    const cachedDocument = await getFromRedis<ContentDocument>({ key: cacheKey });
    if (cachedDocument) {
      inMemorySuggestionsCache.set(cacheKey, { data: cachedDocument, timestamp: now });
      return cachedDocument;
    }

    await connectDB();

    const document = await Contents.findOne({
      isActive: true,
      slug
    })
      .select(["category.primary", "tag.aiTags", "tag.relatedAITags"])
      .lean();

    if (!document) {
      return null;
    }

    const primaryCategory = document.category?.primary;
    const aiTags = document.tag?.aiTags || [];
    const relatedAITags = document.tag?.relatedAITags || [];

    const [coupons, aiTagContents, relatedAITagContents, categoryContents] =
      await Promise.all([
        primaryCategory
          ? Coupons.find({
              isActive: true,
              $or: [
                { applicableCategories: { $size: 0 } },
                { applicableCategories: primaryCategory }
              ]
            })
              .select([
                "type",
                "code",
                "description",
                "minimumOrderAmount",
                "valid",
                "limitPerCustomer",
                "discount.type",
                "discount.limit",
                "discount.percentage"
              ])
              .limit(10)
              .lean()
          : Promise.resolve([]),
        aiTags.length > 0
          ? Contents.find({
              slug: { $ne: slug },
              isActive: true,
              "tag.aiTags": { $in: aiTags }
            })
              .select(SELECT.contentSuggestion)
              .populate(POPULATE.contentSuggestion)
              .limit(20)
              .lean()
          : Promise.resolve([]),
        relatedAITags.length > 0
          ? Contents.find({
              slug: { $ne: slug },
              isActive: true,
              "tag.aiTags": { $in: relatedAITags }
            })
              .select(SELECT.contentSuggestion)
              .populate(POPULATE.contentSuggestion)
              .limit(20)
              .lean()
          : Promise.resolve([]),
        primaryCategory
          ? Contents.find({
              slug: { $ne: slug },
              isActive: true,
              "category.primary": primaryCategory
            })
              .select(SELECT.contentSuggestion)
              .populate(POPULATE.contentSuggestion)
              .limit(20)
              .lean()
          : Promise.resolve([])
      ]);

    const shuffledAITagContents = getRandomElements({
      array: aiTagContents as any[],
      count: 12
    });

    const filteredRelatedAITagContents = (relatedAITagContents as any[]).filter(
      ({ _id }) =>
        !shuffledAITagContents.find(({ _id: id }) => String(id) === String(_id))
    );
    const shuffledRelatedAITagContents = getRandomElements({
      array: filteredRelatedAITagContents,
      count: 12
    });

    const filteredCategoryContents = (categoryContents as any[]).filter(
      ({ _id }) =>
        !shuffledAITagContents.find(
          ({ _id: id }) => String(id) === String(_id)
        ) &&
        !shuffledRelatedAITagContents.find(
          ({ _id: id }) => String(id) === String(_id)
        )
    );
    const shuffledCategoryContents = getRandomElements({
      array: filteredCategoryContents,
      count: 16
    });

    const documentObj: any = {
      ...document,
      _coupons: coupons,
      _suggestions: {
        aiTag: aiTags.length ? shuffledAITagContents : [],
        relatedAITag: relatedAITags.length ? shuffledRelatedAITagContents : [],
        category: shuffledCategoryContents
      } as unknown as ContentSuggestionDocument
    };

    const finalResult = JSON.parse(JSON.stringify(documentObj)) as ContentDocument;

    // Cache in L1 & L2
    inMemorySuggestionsCache.set(cacheKey, { data: finalResult, timestamp: now });
    await setToRedis({ key: cacheKey, value: finalResult, ttl: 180 });

    return finalResult;
  } catch (error: any) {
    console.error(`❌ DB Error in getContentPageDetailsV for ${slug}:`, error);
    return null;
  }
};

export const getProductSlugs = async (): Promise<ContentDocument[] | null> => {
  try {
    await connectDB();
    const documents = await Contents.find({
      isActive: true,
      type: "product"
    })
      .select(["slug"])
      .sort({ slug: 1 })
      .lean();

    return documents as unknown as ContentDocument[];
  } catch (error: any) {
    console.error('[ERR getProductSlugs]', error);
    return null;
  }
};

// In-memory L1 cache for products
const inMemoryProductCache = new Map<string, { data: ContentDocument; timestamp: number }>();
const PRODUCT_L1_TTL_MS = 60 * 1000; // 60 seconds

export const getFullProductData = async (slug: string): Promise<ContentDocument | null> => {
  const cacheKey = `${CONTENT_PAGE_CACHE_KEY}_${slug}`;

  try {
    const now = Date.now();

    // 1. Try In-Memory L1 Cache (ultra-fast <1ms)
    const l1 = inMemoryProductCache.get(cacheKey);
    if (l1 && (now - l1.timestamp) < PRODUCT_L1_TTL_MS) {
      return l1.data;
    }

    // 2. Try Redis cache (L2)
    const cachedDocument = await getFromRedis<ContentDocument>({
      key: cacheKey
    });

    if (cachedDocument) {
      inMemoryProductCache.set(cacheKey, { data: cachedDocument, timestamp: now });
      return cachedDocument;
    }

    // 3. Cache miss - fetch from MongoDB in a single unified query
    await connectDB();

    const [document, initialCoupons] = await Promise.all([
      Contents.findOne({
        isActive: true,
        slug
      })
        .select([
          "name",
          "slug",
          "category",
          "media",
          "availability",
          "detail",
          "quality",
          "delivery",
          "price",
          "edible",
          "seoMeta",
          "createdAt",
          "customization",
          "addons",
          "variants",
          "tag"
        ])
        .populate([
          ...POPULATE.contentBasic,
          ...POPULATE.contentCustomization,
          ...POPULATE.addon,
          {
            path: "variants.label",
            select: ["label"]
          },
          {
            path: "variants.reference.reference",
            select: [
              "name",
              "slug",
              "price.base.mrp",
              "price.base.price",
              "price.cities.city",
              "price.cities.mrp",
              "price.cities.price"
            ],
            populate: [
              {
                path: "media.primary",
                select: SELECT.image
              }
            ],
            strictPopulate: false
          },
          {
            path: "variants.custom.unit",
            select: ["name", "abbr", "serves"],
            strictPopulate: false
          },
          {
            path: "variants.custom.variants",
            select: ["label", "price", "value"],
            populate: [
              {
                path: "image",
                select: SELECT.image
              }
            ],
            strictPopulate: false
          }
        ])
        .lean(),
      Coupons.find({ isActive: true })
        .select([
          "type",
          "code",
          "description",
          "minimumOrderAmount",
          "valid",
          "limitPerCustomer",
          "discount.type",
          "discount.limit",
          "discount.percentage",
          "applicableCategories"
        ])
        .limit(20)
        .lean()
    ]);

    if (!document) {
      return null;
    }

    const docObj: any = { ...document };

    // Process availability
    if (
      docObj?.availability?.availableAt === "cities" &&
      docObj?.availability?.limitAvailability
    ) {
      if (docObj?.price?.cities?.length) {
        docObj.availability.cities = docObj.price.cities.map(
          ({ city }: any) => city as string
        );
      } else {
        docObj.availability.cities = [];
      }
    }

    // Match coupons for this category
    const categoryId = String(
      (docObj.category?.primary as any)?._id || docObj.category?.primary || ""
    );
    const matchedCoupons = (initialCoupons || []).filter((c: any) => {
      if (!c.applicableCategories || c.applicableCategories.length === 0) return true;
      return c.applicableCategories.some((catId: any) => String(catId) === categoryId);
    }).slice(0, 10);

    docObj._coupons = matchedCoupons;

    const parsedDocument = JSON.parse(JSON.stringify(docObj)) as unknown as ContentDocument;

    // Cache the result in Memory L1 and Redis
    inMemoryProductCache.set(cacheKey, { data: parsedDocument, timestamp: now });
    await setToRedis({
      key: cacheKey,
      value: parsedDocument,
      ttl: 300
    });

    return parsedDocument;
  } catch (error: any) {
    console.error('[ERR getFullProductData]', slug, error);
    return null;
  }
};
