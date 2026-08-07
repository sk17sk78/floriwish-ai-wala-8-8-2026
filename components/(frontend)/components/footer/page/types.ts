import { type PageDocument as Document } from "@/common/types/documentation/_document";

export interface FooterSectionLinkDocument {
  _id?: string;
  label: string;
  path: string;
}

export interface FooterSectionDocument extends Partial<Document> {
  heading: string;
  order: number;
  path?: string;
  links: FooterSectionLinkDocument[];
}
