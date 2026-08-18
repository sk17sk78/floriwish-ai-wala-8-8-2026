import { Schema, Document, Model } from "mongoose";

export interface IAppliedCategory {
  categoryId: Schema.Types.ObjectId | string;
  categoryType: string;
  slug: string;
  name: string;
}

export interface IGlobalCategoryBannerDocument extends Document {
  title: string;
  name: string;
  altText: string;
  linkUrl?: string;
  openInNewTab: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  desktopImage: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  mobileImage: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  appliedCategories: IAppliedCategory[];
  allCategories: boolean;
  autoApplyFuture: boolean;
  isActive: boolean;
  priority: number;
  targetDevice?: "all" | "desktop" | "mobile";
  bannerType: "default" | "mini" | "micro" | "large" | "square";
  autoScroll: boolean;
  scrollInterval: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IGlobalCategoryBannerModel = Model<IGlobalCategoryBannerDocument>;

const appliedCategorySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    categoryType: {
      type: String,
      required: true,
      default: "ContentCategory"
    },
    slug: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

export const globalCategoryBannerSchema = new Schema<
  IGlobalCategoryBannerDocument,
  IGlobalCategoryBannerModel
>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    altText: {
      type: String,
      required: false,
      default: "",
      trim: true
    },
    linkUrl: {
      type: String,
      required: false,
      default: "",
      trim: true
    },
    openInNewTab: {
      type: Boolean,
      required: false,
      default: false
    },
    startDate: {
      type: Date,
      required: false,
      default: null
    },
    endDate: {
      type: Date,
      required: false,
      default: null
    },
    desktopImage: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: ""
      },
      width: {
        type: Number,
        default: 1200
      },
      height: {
        type: Number,
        default: 400
      }
    },
    mobileImage: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        default: ""
      },
      width: {
        type: Number,
        default: 480
      },
      height: {
        type: Number,
        default: 240
      }
    },
    appliedCategories: [
      {
        type: appliedCategorySchema,
        default: []
      }
    ],
    allCategories: {
      type: Boolean,
      required: false,
      default: false
    },
    autoApplyFuture: {
      type: Boolean,
      required: false,
      default: true
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
      index: true
    },
    priority: {
      type: Number,
      required: false,
      default: 10,
      index: true
    },
    targetDevice: {
      type: String,
      enum: ["all", "desktop", "mobile"],
      default: "all"
    },
    bannerType: {
      type: String,
      enum: ["default", "mini", "micro", "large", "square"],
      default: "default"
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    scrollInterval: {
      type: Number,
      default: 7
    },
    createdBy: {
      type: String,
      required: false,
      default: "admin"
    },
    updatedBy: {
      type: String,
      required: false,
      default: "admin"
    }
  },
  { timestamps: true }
);

globalCategoryBannerSchema.index({ "appliedCategories.slug": 1 });
globalCategoryBannerSchema.index({ isActive: 1, priority: -1 });
