// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// utils
import { memo } from "react";

// hooks
import { useMemo } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type BannerImageDocument } from "@/common/types/documentation/nestedDocuments/bannerImage";
import { type ImageDocument } from "@/common/types/documentation/media/image";

function CategoryBannerImage({
  bannerImage
}: {
  bannerImage: BannerImageDocument;
}) {
  const mobile = useMemo(
    () => (bannerImage.mobile as ImageDocument) || (bannerImage.desktop as ImageDocument),
    [bannerImage]
  );
  const desktop = useMemo(
    () => (bannerImage.desktop as ImageDocument) || (bannerImage.mobile as ImageDocument),
    [bannerImage]
  );

  const content = (
    <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden">
      {/* Mobile Banner */}
      <div className="sm:hidden w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden">
        <NextImage
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          src={mobile?.url || ""}
          alt={mobile?.alt || mobile?.defaultAlt || "Banner Image"}
          width={480}
          height={240}
          quality={75}
          sizes="(max-width: 640px) 100vw, 480px"
        />
      </div>
      {/* Desktop Banner */}
      <div className="max-sm:hidden w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden">
        <NextImage
          className="object-cover object-center h-full w-full rounded-2xl sm:rounded-3xl"
          src={desktop?.url || ""}
          alt={desktop?.alt || desktop?.defaultAlt || "Banner Image"}
          width={1200}
          height={400}
          quality={75}
          sizes="(min-width: 640px) 100vw, 1200px"
        />
      </div>
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
