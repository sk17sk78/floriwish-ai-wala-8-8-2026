// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";

// types
import { ImageDocument } from "@/common/types/documentation/media/image";

function ContentReviewImage({
  image,
  showMore,
  moreCount,
  onClick
}: {
  image: ImageDocument;
  showMore: boolean;
  moreCount: number;
  onClick: () => void;
}) {
  const url = image?.url || "";
  const alt = image?.alt || "";
  const defaultAlt = image?.defaultAlt || "";
  return (
    <div
      className="aspect-square bg-neutral-200 flex items-center justify-center relative overflow-hidden rounded-xl cursor-pointer"
      onClick={onClick}
    >
      <NextImage
        src={url}
        alt={alt || defaultAlt || "Review Image"}
        className="w-full h-full object-center  object-cover"
        height={250}
        width={250}
        quality={25}
        draggable={false}
      />
      {showMore && (
        <div className="w-full h-full flex items-center justify-center z-10 bg-black/40 absolute text-white font-semibold text-[18px]">
          +{moreCount}
        </div>
      )}
    </div>
  );
}

export default memo(ContentReviewImage);
