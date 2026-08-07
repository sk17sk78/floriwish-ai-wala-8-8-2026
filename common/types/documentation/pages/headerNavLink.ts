// types
import { type PageDocument as Document } from "@/common/types/documentation/_document";
import { type HeaderNavLinkSectionDocument } from "@/common/types/documentation/nestedDocuments/headerNavLinkSection";
import { type ClickableImageDocument } from "@/common/types/documentation/nestedDocuments/clickableImage";
import { type Model } from "mongoose";

// document
export interface HeaderNavLinkDocument extends Document {
  label: string;
  order: number;
  path?: string;
  sections: HeaderNavLinkSectionDocument[];
  quickLinks: ClickableImageDocument[];
}

// model
export type HeaderNavLinkModel = Model<HeaderNavLinkDocument>;
