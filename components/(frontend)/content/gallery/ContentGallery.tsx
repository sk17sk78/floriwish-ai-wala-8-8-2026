"use client";

// utils
import { memo, useMemo } from "react";

// hooks
import { useEffect, useState } from "react";

// components
import ContentGalleryImage from "./components/ContentGalleryImage";
import ContentGalleryPreviews from "./components/ContentGalleryPreviews";
import ContentGallerySimilarContentDrawer from "./components/ContentGallerySimilarContentDrawer";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentGallery({
  serviceImage,
  images,
  showSimilarContentDrawer,
  similarContents,
  tag,
  categoryId,
  productSlug,
  categoryName,
  categoryUrl,
  tags,
  isProduct,
  onClickViewSimilar,
  onChangeShowSimilarContentDrawer
}: {
  serviceImage?: ImageDocument;
  images: ImageDocument[];
  showSimilarContentDrawer: boolean;
  similarContents: ContentDocument[];
  tag?: { label: string; color: string };
  categoryId?: string;
  productSlug?: string;
  categoryName?: string;
  categoryUrl?: string;
  tags?: string[];
  isProduct?: boolean;
  onClickViewSimilar?: () => void;
  onChangeShowSimilarContentDrawer: (showSimilarContentDrawer: boolean) => void;
}) {
  // states
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // variables
  const finalImages = useMemo(
    () => (serviceImage ? [...images, serviceImage] : images),
    [serviceImage, images]
  );

  // side effects
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  return (
    <>
      <section className="grid grid-cols-1 items-start gap-3 xl:sticky xl:top-6 xl:grid-cols-[92px_minmax(0,1fr)] xl:gap-5">
        <ContentGalleryPreviews
          activeIndex={activeIndex}
          images={finalImages}
          onChangeActiveIndex={setActiveIndex}
        />
        <ContentGalleryImage
          activeIndex={activeIndex}
          images={finalImages}
          tag={tag}
          categoryUrl={categoryUrl}
          onChangeActiveIndex={setActiveIndex}
          onClickViewSimilar={onClickViewSimilar}
        />
      </section>
      <ContentGallerySimilarContentDrawer
        showDrawer={showSimilarContentDrawer}
        contents={similarContents}
        categoryId={categoryId}
        productSlug={productSlug}
        categoryName={categoryName}
        categoryUrl={categoryUrl}
        tags={tags}
        isProduct={isProduct}
        onChangeShowDrawer={onChangeShowSimilarContentDrawer}
      />
    </>
  );
}

export default memo(ContentGallery);
