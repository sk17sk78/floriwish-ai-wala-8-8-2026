import { type PageDocument as Document } from "@/common/types/documentation/_document";

export interface HeaderNavLinkSectionLinkDocument {
  _id?: string;
  label: string;
  path: string;
  tag?: any; 
}

export interface HeaderNavLinkSectionDocument {
  _id?: string;
  heading: string;
  links: HeaderNavLinkSectionLinkDocument[];
}

export interface HeaderNavLinkDocument extends Partial<Document> {
  label: string;
  order: number;
  path?: string;
  sections: HeaderNavLinkSectionDocument[];
  quickLinks?: any[]; 
}
