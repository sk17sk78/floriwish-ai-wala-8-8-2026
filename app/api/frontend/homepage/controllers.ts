// DB connection
import connectDB from "@/db/mongoose/connection";

// model
import models from "@/db/mongoose/models";
const { HomepageLayouts } = models;

// utils
import { handleError } from "@/common/utils/api/error";

// types
import { type HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { type MongooseErrorType } from "@/common/types/apiTypes";

// constants
const SELECT = {
  content: [
    "type",
    "name",
    "slug",
    "media.primary",
    "delivery",
    "quality.rating.value",
    "quality.rating.count",
    "price",
    "edible",
  ],
  image: ["alt", "defaultAlt", "url"],
};

const POPULATE = {
  content: [
    {
      path: "media.primary",
      select: SELECT.image,
    },
    {
      path: "tag.promotionTag",
      select: ["name"],
      populate: [
        {
          path: "color",
          select: ["hexCode"],
        },
      ],
      strictPopulate: false,
    },
    {
      path: "delivery.processingTime",
      select: ["hours"],
    },
    {
      path: "delivery.slots.type",
      select: ["name", "price", "timeSlots"],
    },
  ],
};

// controllers
export const getHomepageLayouts = async (): Promise<
  HomepageLayoutDocument[] | null
> => {
  try {
    await connectDB();

    const documents = await HomepageLayouts.find({
      isActive: true,
    })
      .select([
        "type",
        "title",
        "subtitle",
        "layout",
        "leftAlign",
        "extraSpacing",
        "scrollable",
        "customBG",
        "order",
      ])
      .populate([
        {
          path: "layout.banner.images.desktop",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.banner.images.mobile",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.collage.images.image",
          select: SELECT.image,
          strictPopulate: false,
        },
        {
          path: "layout.content",
          select: SELECT.content,
          populate: POPULATE.content,
          strictPopulate: false,
        },
        {
          path: "layout.category.images.image",
          select: SELECT.image,
          strictPopulate: false,
        },
      ])
      .sort({
        order: 1,
      });

    if (!documents) {
      return null;
    }

    return JSON.parse(JSON.stringify(documents));
  } catch (error: any) {
    return null;
  }
};
