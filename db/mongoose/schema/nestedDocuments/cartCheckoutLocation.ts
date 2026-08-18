// libraries
import { Schema } from "mongoose";

// types
import { CartCheckoutLocationDocument } from "@/common/types/documentation/nestedDocuments/cartCheckoutLocation";

// schemas
export const cartCheckoutLocationSchema =
  new Schema<CartCheckoutLocationDocument>(
    {
      address: {
        type: String,
        required: false,
        default: ""
      },
      landmark: {
        type: String,
        required: false
      },
      city: {
        type: String,
        required: false,
        default: ""
      },
      pincode: {
        type: String,
        required: false,
        default: ""
      }
    },
    { timestamps: true }
  );
