// types
import { type NestedDocument as Document } from "@/common/types/documentation/_document";
import { type PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";

// document
export interface FooterSectionLinkDocument extends Document {
  label: string;
  path: string;
  tag?: string | PromotionTagDocument;
}
