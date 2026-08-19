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
  bannerImage
}: {
  bannerImage: BannerImageDocument;
}) {
  const deskDoc = bannerImage.desktop as ImageDocument | undefined;
  const mobDoc = bannerImage.mobile as ImageDocument | undefined;

  const desktopUrl = convertToCloudFrontUrl(deskDoc?.url || mobDoc?.url || "");
  const hasMobile = Boolean(mobDoc?.url && mobDoc.url.trim().length > 0);
  const mobileUrl = hasMobile ? convertToCloudFrontUrl(mobDoc?.url || "") : desktopUrl;

  const alt = deskDoc?.alt || deskDoc?.defaultAlt || mobDoc?.alt || mobDoc?.defaultAlt || "Category Banner";

  const content = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100">
      <picture className="w-full h-full block">
        {hasMobile && (
          <source media="(max-width: 639px)" srcSet={mobileUrl} />
        )}
        <source media="(min-width: 640px)" srcSet={desktopUrl} />
        <img
          src={desktopUrl || mobileUrl}
          alt={alt}
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          loading="lazy"
          decoding="async"
          width={1200}
          height={400}
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
