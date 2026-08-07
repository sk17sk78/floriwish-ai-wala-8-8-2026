// utils
import { memo } from "react";

// components
import NextImage from "@/components/custom/NextImage";
import { COMPANY_LOGO_URL, COMPANY_NAME } from "@/common/constants/companyDetails";

function CompanyNameImage() {
  return (
    <NextImage
      src={COMPANY_LOGO_URL}
      alt={COMPANY_NAME}
      width={100}
      height={40}
      priority
      quality={75}
    />
  );
}

export default memo(CompanyNameImage);
