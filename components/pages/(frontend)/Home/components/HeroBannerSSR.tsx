/**
 * HeroBannerSSR — Pure Server Component (NO "use client")
 *
 * Renders the first hero banner image directly into the initial HTML so
 * Googlebot and PageSpeed mobile crawler can detect an LCP candidate
 * WITHOUT waiting for JavaScript to hydrate.
 *
 * The carousel (BannerCarouselNew) lazy-loads on top of this as a
 * progressive enhancement after JS is ready.
 */

import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";
import Link from "next/link";

export type HeroBannerSSRProps = {
  desktopUrl: string;
  mobileUrl?: string;
  alt: string;
  link?: string;
  /** true = 2:1 mobile + 3:1 desktop (when dedicated mobile banners exist) */
  hasDedicatedMobile: boolean;
};

export default function HeroBannerSSR({
  desktopUrl,
  mobileUrl,
  alt,
  link,
  hasDedicatedMobile,
}: HeroBannerSSRProps) {
  const desktop = convertToCloudFrontUrl(desktopUrl);
  const mobile = mobileUrl ? convertToCloudFrontUrl(mobileUrl) : desktop;

  const imgContent = (
    // Explicit width+height → browser knows aspect ratio before image loads → CLS = 0
    // fetchPriority="high" → browser downloads this immediately (critical resource)
    // loading="eager" → no lazy-load deferral
    // decoding="sync" → decode inline so it paints immediately
    <picture className="w-full h-full block">
      {hasDedicatedMobile && mobile && mobile !== desktop && (
        <source
          media="(max-width: 639px)"
          srcSet={mobile}
          width={800}
          height={400}
        />
      )}
      <source
        media="(min-width: 640px)"
        srcSet={desktop}
        width={1200}
        height={400}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hasDedicatedMobile ? mobile : desktop}
        alt={alt || "Banner Image"}
        width={hasDedicatedMobile ? 800 : 1200}
        height={400}
        loading="eager"
        // @ts-ignore — fetchPriority is valid HTML but not yet in all @types
        fetchPriority="high"
        decoding="sync"
        sizes={hasDedicatedMobile ? "(max-width: 639px) 100vw, 100vw" : "100vw"}
        className="w-full h-full object-cover object-center"
        style={{ display: "block" }}
      />
    </picture>
  );

  const wrapper = (
    <div
      className="absolute inset-0 z-[1] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100"
      aria-hidden="false"
    >
      {imgContent}
    </div>
  );

  if (link && link.length > 0 && link !== "#") {
    return (
      <Link
        href={link}
        aria-label={alt || "Banner"}
        className="absolute inset-0 z-[1] block rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100"
        prefetch={false}
      >
        {imgContent}
      </Link>
    );
  }

  return wrapper;
}
