// utils
import { memo } from "react";

// components
import CategoryBanner from "./CategoryBanner";

// types
import { type BannerDocument } from "@/common/types/documentation/nestedDocuments/banner";

function CategoryBannerSection({ banner }: { banner?: BannerDocument }) {
  // Check if banner exists AND has images
  if (banner && banner.images && Array.isArray(banner.images) && banner.images.length > 0) {
    return <CategoryBanner banner={banner} />;
  }

  return <></>;
}

export default memo(CategoryBannerSection);
