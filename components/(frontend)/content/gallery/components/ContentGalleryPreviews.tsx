// utils
import { memo } from "react";

// components
import ContentGalleryPreview from "./ContentGalleryPreview";

// types
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentGalleryPreviews({
  activeIndex,
  images,
  onChangeActiveIndex
}: {
  activeIndex: number;
  images: ImageDocument[];
  onChangeActiveIndex: (activeIndex: number) => void;
}) {
  return (
    <section className="hidden xl:flex xl:flex-col gap-3">
      {images.filter(img => img && img.url).map((image, index) => (
        <ContentGalleryPreview
          key={String(image._id)}
          isActive={activeIndex === index}
          image={image}
          onClick={() => {
            onChangeActiveIndex(index);
          }}
        />
      ))}
    </section>
  );
}

export default memo(ContentGalleryPreviews);
