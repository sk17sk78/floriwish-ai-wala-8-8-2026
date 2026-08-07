// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// constants
import { MOBILE_BREAKPOINT } from "@/common/constants/breakPoints";

// components
import Image from "next/image";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

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
  async,
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
  // Safety check - return null if no src
  if (!src) {
    return null;
  }

  // Convert to CloudFront URL if applicable
  const optimizedSrc = convertToCloudFrontUrl(src);

  // BYPASS PROXY FOR CLOUDFRONT: If it's a CloudFront URL, we MUST bypass
  // the slow Next.js image optimization proxy.
  const isCloudFront = optimizedSrc?.includes("cloudfront.net");

  // Determine loading strategy
  const shouldPrioritize = priority || eager;
  const loadingStrategy = shouldPrioritize ? "eager" : "lazy";

  // If we should bypass proxy, we set unoptimized=true
  // This will make next/image render a standard <img> tag with direct src
  const bypassProxy = isCloudFront || unoptimized || !OPTIMIZE_IMAGE;

  return (
    <Image
      src={optimizedSrc}
      alt={alt || "Image"}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      draggable={draggable || false}
      unoptimized={bypassProxy}
      quality={quality || 85}
      loading={loadingStrategy}
      decoding={shouldPrioritize ? "sync" : async ? "async" : "auto"}
      priority={shouldPrioritize}
      fetchPriority={shouldPrioritize ? "high" : "auto"}
      sizes={
        sizes ||
        (mobileWidth && desktopWidth
          ? `(max-width: ${MOBILE_BREAKPOINT}px) ${mobileWidth}px, ${desktopWidth}px`
          : `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`)
      }
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={onError}
      style={style}
      className={className}
    />
  );
}
