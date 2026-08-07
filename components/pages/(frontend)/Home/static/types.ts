import { PageLayoutDocument } from "@/common/types/documentation/nestedDocuments/pageLayout";
import { HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";

export type HomepageLayoutStructure = {
  _id: string;
  order: number;
  tag: HomepageLayoutDocument["type"] | "title";
  isDisabled?: boolean;
  layout: PageLayoutDocument;
  isNew?: boolean;
  isModified?: boolean;
  customBG?: string;
  leftAlign?: boolean;
} & (
  | {
      type: "title";
      data: string;
      subtitle?: string;
    }
  | {
      type: "component";
      extraSpacing?: boolean;
      scrollable?: boolean;
    }
);
