"use client";

// utils
import { memo, useMemo } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

// types
import { type BannerImageDocument } from "@/common/types/documentation/nestedDocuments/bannerImage";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function CategoryBannerImage({
  bannerImage,
  isPriority = false
}: {
  bannerImage: BannerImageDocument;
  isPriority?: boolean;
}) {
  const deskDoc = bannerImage.desktop as ImageDocument | undefined;
  const mobDoc = bannerImage.mobile as ImageDocument | undefined;

  const desktopUrl = convertToCloudFrontUrl(deskDoc?.url || mobDoc?.url || "");
  const hasMobile = Boolean(
    mobDoc?.url &&
    mobDoc.url.trim().length > 0 &&
    mobDoc.url !== deskDoc?.url
  );
  const mobileUrl = hasMobile ? convertToCloudFrontUrl(mobDoc?.url || "") : desktopUrl;

  const alt = deskDoc?.alt || deskDoc?.defaultAlt || mobDoc?.alt || mobDoc?.defaultAlt || "Category Banner";

  const content = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100">
      <picture className="w-full h-full block">
        {hasMobile && (
          <source media="(max-width: 639px)" srcSet={mobileUrl} width={800} height={400} />
        )}
        <source media="(min-width: 640px)" srcSet={desktopUrl} width={1200} height={400} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hasMobile ? mobileUrl : (desktopUrl || mobileUrl)}
          alt={alt}
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          // isPriority=true (first image) → eager load for LCP
          loading={isPriority ? "eager" : "lazy"}
          // @ts-ignore
          fetchPriority={isPriority ? "high" : "auto"}
          decoding={isPriority ? "sync" : "async"}
          width={hasMobile ? 800 : 1200}
          height={hasMobile ? 400 : 400}
          sizes="100vw"
        />
      </picture>
    </div>
  );

  return bannerImage.path ? (
    <Link
      href={bannerImage.path}
      prefetch={false}
      className="block w-full h-full"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

export default memo(CategoryBannerImage);
