// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { AITags, Contents, ContentCategories, TrendingSearchKeywords } = models;

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type AITagDocument } from "@/common/types/documentation/presets/aiTag";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type MongooseErrorType } from "@/common/types/apiTypes";
import { type TrendingSearchKeywordDocument } from "@/common/types/documentation/presets/trendingSearchKeyword";

// constants
const SEARCH_CONTENT_LIMIT = 100;

const SELECT = {
  content: [
    "type",
    "name",
    "slug",
    "price.base.price",
    "price.cities",
    "media.primary.url",
    "delivery.processingTime",
    "delivery.slots.type",
    "delivery.slots.timeSlots",
    "quality.rating.value"
  ],
  image: ["alt", "defaultAlt", "url"]
};

const POPULATE = {
  content: [
    {
      path: "delivery.processingTime",
      select: ["hours"]
    },
    {
      path: "delivery.slots.type",
      select: ["name", "price", "timeSlots"]
    }
  ]
};

// controllers
export const getTrendingSearchKeywords = async (): Promise<
  TrendingSearchKeywordDocument[] | null
> => {
  try {
    await connectDB();

    const documents = await TrendingSearchKeywords.find({
      isActive: true,
    }).select(["label", "path"]);

    if (!documents) {
      return null;
    }

    return documents;
  } catch (error: any) {
    return null;
  }
};

export const getAITags = async (): Promise<AITagDocument[] | null> => {
  try {
    await connectDB();

    const documents = await AITags.find({
      isActive: true,
    }).select(["name"]);

    if (!documents) {
      return null;
    }

    return documents;
  } catch (error: any) {
    return null;
  }
};

export const getContentCategories = async (): Promise<
  ContentCategoryDocument[] | null
> => {
  try {
    await connectDB();

    const documents = await ContentCategories.find({
      isActive: true,
    }).select(["name", "slug"]);

    if (!documents) {
      return null;
    }

    return documents;
  } catch (error: any) {
    return null;
  }
};

export const getContents = async (): Promise<ContentDocument[] | null> => {
  try {
    await connectDB();

    const documents = await Contents.find({
      isActive: true,
    })
      .sort({ name: 1 })
      .limit(SEARCH_CONTENT_LIMIT)
      .select(SELECT.content)
      .populate(POPULATE.content)
      .lean();

    if (!documents) {
      return null;
    }

    return documents as unknown as ContentDocument[];
  } catch (error: any) {
    return null;
  }
};
