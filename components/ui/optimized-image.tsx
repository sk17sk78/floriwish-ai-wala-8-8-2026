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

// Tiny 1x1 pixel base64 placeholder
const DEFAULT_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

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
  blurDataURL,
  draggable,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
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
    <div className={cn("relative overflow-hidden", className)}>
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
        blurDataURL={blurDataURL || DEFAULT_BLUR}
        draggable={draggable}
        className={cn(
          "transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100",
          // Default object-fit only if no imageClassName overrides it
          !imageClassName && "object-cover w-full h-full",
          imageClassName
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {/* Shimmer skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  );
}
