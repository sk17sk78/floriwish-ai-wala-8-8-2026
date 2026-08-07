// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";

function CompanyLogoImage() {
  return (
    <NextImage
      src={"/logo/something-icon.webp"}
      alt="Floriwish Logo"
      width={30}
      height={40}
      priority
      quality={75}
    />
  );
}

export default memo(CompanyLogoImage);
