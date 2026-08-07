// libraries
import { Schema } from "mongoose";

// schemas
import { bannerSchema } from "@/db/mongoose/schema/nestedDocuments/banner";
import { clickableImageSchema } from "@/db/mongoose/schema/nestedDocuments/clickableImage";

// types
import { type TopicMediaDocument } from "@/common/types/documentation/nestedDocuments/topicMedia";

// schemas
export const topicMediaSchema = new Schema<TopicMediaDocument>(
  {
    banner: {
      type: bannerSchema,
      required: false
    },
    quickLinks: [
      {
        type: clickableImageSchema,
        required: false
      }
    ],
    scrollableQuickLinks: {
      type: Boolean,
      required: false
    }
  },
  { timestamps: true }
);
