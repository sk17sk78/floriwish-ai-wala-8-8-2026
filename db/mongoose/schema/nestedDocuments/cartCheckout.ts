// libraries
import { Schema } from "mongoose";

// schemas
import { cartCheckoutContactSchema } from "@/db/mongoose/schema/nestedDocuments/cartCheckoutContact";
import { cartCheckoutLocationSchema } from "@/db/mongoose/schema/nestedDocuments/cartCheckoutLocation";

// types
import { CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";

// schema
export const cartCheckoutSchema = new Schema<CartCheckoutDocument>(
  {
    name: {
      type: String,
      required: false,
      default: ""
    },
    contact: {
      type: cartCheckoutContactSchema,
      required: false
    },
    location: {
      type: cartCheckoutLocationSchema,
      required: false
    },
    note: {
      type: String,
      required: false
    },
    occasion: {
      type: Schema.Types.Mixed,
      ref: "Occasion",
      required: false
    },
    venue: {
      type: Schema.Types.Mixed,
      ref: "Venue",
      required: false
    },
    deliverToSomeoneElse: {
      type: Boolean,
      required: false,
      default: false
    },
    receiverName: {
      type: String,
      required: false
    },
    receiverMobileNumber: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);
