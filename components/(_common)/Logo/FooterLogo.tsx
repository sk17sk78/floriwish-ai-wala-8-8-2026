// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

function FooterLogo() {
  return (
    <Link
      href={"/"}
      prefetch={false}
      className={`flex items-center gap-1.5 sm:gap-3 min-w-fit max-w-fit contrast-125 brightness-75 max-sm:mb-3 max-sm:mt-5`}
    >
      <NextImage
        src={"/logo/somethiong.webp"}
        alt="Floriwish Logo"
        width={30}
        height={40}
        priority
        quality={75}
        className="w-[30px] h-[40px]"
      />
      <NextImage
        src={"/logo/somethiong-icon.webp"}
        alt="Floriwish Brand Name"
        width={100}
        height={40}
        priority
        quality={75}
        className="w-[100px] h-[27px]"
      />
    </Link>
  );
}

export default memo(FooterLogo);
