// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";
import { COMPANY_LOGO_URL } from "@/common/constants/companyDetails";

function HeaderLogo({ atFooter }: { atFooter?: true }) {
  return (
    <Link
      href={"/"}
      prefetch={false}
      className={`flex items-center gap-1.5 lg:gap-3 min-w-fit max-w-fit`}
    >
      <NextImage
        src={COMPANY_LOGO_URL}
        alt="Logo"
        width={160}
        height={43}
        priority
        className="h-auto w-32 sm:w-24 md:w-28 lg:w-32 object-cover object-center"
      />
    </Link>
  );
}

export default memo(HeaderLogo);
