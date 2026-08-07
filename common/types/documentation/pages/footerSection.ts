// types
import { type PageDocument as Document } from "@/common/types/documentation/_document";
import { type FooterSectionLinkDocument } from "@/common/types/documentation/nestedDocuments/footerSectionLink";
import { type Model } from "mongoose";

// document
export interface FooterSectionDocument extends Document {
  heading: string;
  order: number;
  path?: string;
  links: FooterSectionLinkDocument[];
}

// model
export type FooterSectionModel = Model<FooterSectionDocument>;
