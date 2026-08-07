// icons
import FooterLogo from "@/components/(_common)/Logo/FooterLogo";
import { HeadsetIcon, Phone } from "lucide-react";
import { WhatsappSVG } from "@/common/svgs/svg";

// utils
import { memo } from "react";
import { mobileContact, whatsappContact } from "@/common/utils/_contactDetails";

// components
import Link from "next/link";
import HeaderLogo from "@/components/(_common)/Logo/HeaderLogo";
import {
  COMPANY_NUMBER,
  COMPANY_WHATSAPP,
} from "@/common/constants/companyDetails";

function FooterTopLeft() {
  return (
    <section className="flex flex-col text-[13px] sm:text-[10px] md:text-[12px] lg:text-sm gap-1 mt-3 items-center sm:items-start justify-start pb-6 sm:mr-0">
      <HeaderLogo atFooter />
      {/* <span className="text-charcoal/70 text-sm mt-5 sm:mt-8 max-sm:hidden">
        Reach out to us
      </span> */}
      <Link
        target="_blank"
        href={whatsappContact()}
        prefetch={false}
        aria-label="Contact us on WhatsApp"
        className="hidden sm:flex mt-4 items-center justify-start gap-1.5 text-charcoal-2/95 mb-0.5 transition-all duration-300 hover:text-sienna hover:brightness-75 hover:underline hover:underline-offset-4"
      >
        <span>{COMPANY_WHATSAPP}</span>
        <WhatsappSVG
          strokeWidth={1}
          dimensions={20}
          className="min-w-[20px] sm:min-w-[16px] md:min-w-[18px] lg:min-w-[23px] grid place-items-center"
        />
      </Link>
      <Link
        target="_blank"
        href={mobileContact()}
        prefetch={false}
        aria-label="Call us"
        className="hidden sm:flex items-center justify-start gap-1.5 text-charcoal-2/95 my-0.5 transition-all duration-300 hover:text-sienna hover:brightness-75 hover:underline hover:underline-offset-4"
      >
        <span>{COMPANY_NUMBER}</span>
        <Phone
          strokeWidth={1.6}
          height={16}
          width={16}
          className="min-w-[20px] sm:min-w-[16px] md:min-w-[18px] lg:min-w-[25px] grid place-items-center"
        />
      </Link>
    </section>
  );
}

export default memo(FooterTopLeft);
