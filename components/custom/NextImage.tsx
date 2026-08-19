"use client";

// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// constants
import { MOBILE_BREAKPOINT } from "@/common/constants/breakPoints";

// components
import Image from "next/image";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";
import { useState } from "react";

const DEFAULT_FALLBACK_IMAGE = "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp";

export default function NextImage({
  src,
  alt,
  width,
  height,
  mobileWidth,
  desktopWidth,
  draggable,
  unoptimized,
  quality,
  eager,
  async = true,
  className,
  priority,
  fill,
  sizes,
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  desktopWidth?: number;
  draggable?: boolean;
  unoptimized?: boolean;
  quality?: number;
  eager?: boolean;
  async?: boolean;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
}) {
  const [imgSrc, setImgSrc] = useState<string>(src || DEFAULT_FALLBACK_IMAGE);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  // Sync state if src prop changes
  if (src && src !== imgSrc && !hasFailed) {
    setImgSrc(src);
  }

  // Convert to CloudFront URL if applicable
  const currentSrc = hasFailed ? DEFAULT_FALLBACK_IMAGE : (imgSrc || DEFAULT_FALLBACK_IMAGE);
  const optimizedSrc = convertToCloudFrontUrl(currentSrc);

  // Direct AWS CloudFront CDN Edge delivery for sub-30ms instant parallel load without Node.js proxy delay
  const isCloudFront = optimizedSrc?.includes("cloudfront.net");
  const bypassProxy = unoptimized !== undefined ? unoptimized : (isCloudFront || !OPTIMIZE_IMAGE);

  // Determine loading strategy: instant eager load without browser lazy-pause
  const shouldPrioritize = priority || eager;

  return (
    <Image
      src={optimizedSrc}
      alt={alt || "Image"}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      draggable={draggable || false}
      unoptimized={bypassProxy}
      quality={quality || 80}
      loading={shouldPrioritize ? "eager" : "lazy"}
      decoding="async"
      priority={shouldPrioritize}
      fetchPriority={shouldPrioritize ? "high" : "low"}
      sizes={
        sizes ||
        (mobileWidth && desktopWidth
          ? `(max-width: ${MOBILE_BREAKPOINT}px) ${mobileWidth}px, ${desktopWidth}px`
          : width
            ? `(max-width: 640px) ${Math.min(width, 360)}px, (max-width: 1024px) ${Math.min(width, 480)}px, ${width}px`
            : `(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw`)
      }
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={(e) => {
        if (!hasFailed) {
          setHasFailed(true);
          setImgSrc(DEFAULT_FALLBACK_IMAGE);
        }
        if (onError) onError(e);
      }}
      style={style}
      className={className}
    />
  );
}
