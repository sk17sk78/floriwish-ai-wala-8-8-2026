// libraries
import { Schema } from "mongoose";

// schemas
import { cartCheckoutSchema } from "@/db/mongoose/schema/nestedDocuments/cartCheckout";
import { cartItemSchema } from "@/db/mongoose/schema/nestedDocuments/cartItem";
import { cartPriceSchema } from "@/db/mongoose/schema/nestedDocuments/cartPrice";

// types
import {
  CartDocument,
  CartModel
} from "@/common/types/documentation/dynamic/cart";

// schema
export const cartSchema = new Schema<CartDocument, CartModel>(
  {
    isOrdered: {
      type: Boolean,
      required: false,
      default: false
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false
    },
    items: [
      {
        type: cartItemSchema,
        required: true
      }
    ],
    price: {
      type: cartPriceSchema,
      required: true
    },
    checkout: {
      type: cartCheckoutSchema,
      required: false
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: false
    },
    createdBy: {
      type: String,
      required: false
    },
    updatedBy: {
      type: String,
      required: false
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  { timestamps: true }
);

// search index
cartSchema.index({
  createdBy: "text",
  updatedBy: "text"
});

// Performance indexes
cartSchema.index({ customer: 1, isActive: 1 });
cartSchema.index({ isOrdered: 1, createdAt: -1 });
