import { memo } from "react";
import OptimizedImage from "@/components/ui/optimized-image";

function CategoryContentImage({
  index,
  alt,
  url
}: {
  index: number;
  alt: string;
  url: string;
}) {
  return (
    <OptimizedImage
      src={url}
      alt={alt}
      width={300}
      height={300}
      priority={index < 4}
      draggable={false}
      className="w-full h-full"
      imageClassName="max-sm:rounded-t-xl w-full h-full object-cover object-center"
    />
  );
}

export default memo(CategoryContentImage);
