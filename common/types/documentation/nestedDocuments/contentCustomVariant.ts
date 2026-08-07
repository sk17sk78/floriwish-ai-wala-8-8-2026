// types
import { type NestedDocument as Document } from "@/common/types/documentation/_document";
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type ObjectId } from "mongoose";
import { type UnitDocument } from "@/common/types/documentation/presets/unit";

// document
export interface ContentCustomVariantDocument extends Document {
  label?: string;
  price: ContentPriceDocument;
  image?: string | ObjectId | ImageDocument;
  value?: number;
  unit?: string | ObjectId | (UnitDocument & { _id: string });
}
