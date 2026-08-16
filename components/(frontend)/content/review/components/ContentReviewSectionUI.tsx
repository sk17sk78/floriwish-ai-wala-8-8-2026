"use client";

// utils
import { lazy, memo, Suspense } from "react";

// components
import ContentReviews from "./ContentReviews";
const LazyContentReviewImages = lazy(() => import("./ContentReviewImages"));

// types
import { ContentReviewDocument } from "@/common/types/documentation/nestedDocuments/contentReview";
import { ImageDocument } from "@/common/types/documentation/media/image";

function ContentReviewSectionUI({
  contentId,
  review,
  images,
  ratingScore = 4.8
}: {
  contentId: string;
  review: ContentReviewDocument;
  images: ImageDocument[];
  ratingScore?: number;
}) {
  return (
    <div className="w-full flex flex-col gap-4">
      {Boolean(images && images.length > 0) && (
        <Suspense fallback={<></>}>
          <LazyContentReviewImages images={images} />
        </Suspense>
      )}
      <ContentReviews
        contentId={contentId}
        review={review}
        imageCount={images?.length || 0}
        ratingScore={ratingScore}
      />
    </div>
  );
}

export default memo(ContentReviewSectionUI);
