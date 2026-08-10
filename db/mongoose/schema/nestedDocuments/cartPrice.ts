// libraries
import { Schema } from "mongoose";

// types
import { CartPriceDocument } from "@/common/types/documentation/nestedDocuments/cartPrice";

// schemas
export const cartPriceSchema = new Schema<CartPriceDocument>(
  {
    content: {
      type: Number,
      required: false,
      default: 0
    },
    addon: {
      type: Number,
      required: false,
      default: 0
    },
    customization: {
      type: Number,
      required: false,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      required: false,
      default: 0
    },
    platformFee: {
      type: Number,
      required: false,
      default: 0
    },
    total: {
      type: Number,
      required: false,
      default: 0
    },
    paymentPercentage: {
      type: Number,
      required: false,
      default: 100
    },
    couponDiscount: {
      type: Number,
      required: false,
      default: 0
    },
    payable: {
      type: Number,
      required: false,
      default: 0
    },
    due: {
      type: Number,
      required: false,
      default: 0
    }
  },
  { timestamps: true }
);
