"use client";

import { cn } from "@/lib/utils";
import NextImage from "@/components/custom/NextImage";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Classes for the outer wrapper div (e.g. aspect ratio, background) */
  className?: string;
  /** Classes for the inner image element (e.g. object-fit, hover effects) */
  imageClassName?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  draggable?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  imageClassName,
  priority = false,
  quality = 85,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  placeholder = "empty",
  draggable,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 text-sm",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-stone-100/50", className)}>
      <NextImage
        src={src}
        alt={alt}
        width={fill ? undefined : width || 0}
        height={fill ? undefined : height || 0}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        draggable={draggable}
        className={cn(
          "opacity-100 transition-none",
          !imageClassName && "object-cover w-full h-full",
          imageClassName
        )}
        onError={() => {
          setHasError(true);
        }}
      />
    </div>
  );
}
