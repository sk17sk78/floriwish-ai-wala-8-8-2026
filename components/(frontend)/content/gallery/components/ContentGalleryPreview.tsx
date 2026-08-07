// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";

// types
import { type ImageDocument } from "@/common/types/documentation/media/image";

function ContentGalleryPreview({
  isActive,
  image,
  onClick
}: {
  isActive: boolean;
  image: ImageDocument;
  onClick: () => void;
}) {
  // Safety check for null/undefined image
  if (!image || !image.url) {
    return null;
  }

  const { alt, defaultAlt, url } = image;

  return (
    <article
      className="group cursor-pointer rounded-[26px] border bg-white p-1.5 shadow-[0_14px_32px_rgba(17,24,39,0.06)] transition-all duration-300"
      onClick={onClick}
    >
      <NextImage
        src={url}
        alt={alt || defaultAlt || "Content Image"}
        width={80}
        height={80}
        quality={50}
        priority
        draggable={false}
        className={`aspect-square w-full rounded-[20px] border object-cover object-center transition-all duration-300 ${
          isActive
            ? "border-moss shadow-[0_0_0_2px_rgba(173,35,85,0.2)]"
            : "border-transparent opacity-65 group-hover:opacity-100"
        }`}
      />
    </article>
  );
}

export default memo(ContentGalleryPreview);
