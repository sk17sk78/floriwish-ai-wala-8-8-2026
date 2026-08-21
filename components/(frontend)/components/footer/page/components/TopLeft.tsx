"use client";

import React, { memo } from "react";
import Link from "next/link";
import HeaderLogo from "@/components/(_common)/Logo/HeaderLogo";
import {
  COMPANY_NUMBER,
  COMPANY_WHATSAPP,
} from "@/common/constants/companyDetails";
import { MessageCircle, Phone } from "lucide-react";
import { mobileContact, whatsappContact } from "@/common/utils/_contactDetails";

function FooterTopLeft() {
  return (
    <div className="flex flex-col items-start text-left gap-3.5 w-full">
      <div className="origin-left">
        <HeaderLogo atFooter />
      </div>

      <p className="text-xs sm:text-[13px] text-charcoal-3/80 leading-relaxed font-normal max-w-sm">
        India’s premier online gifting platform for fresh flowers, handcrafted cakes, and celebration decor.
      </p>
      
      <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2.5 pt-1 text-xs sm:text-sm md:text-base flex-wrap w-full">
        <Link
          target="_blank"
              rel="noopener noreferrer"
          href={whatsappContact()}
          prefetch={false}
          aria-label="Contact us on WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 no-underline"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
          <span>{COMPANY_WHATSAPP}</span>
        </Link>

        <Link
          target="_blank"
              rel="noopener noreferrer"
          href={mobileContact()}
          prefetch={false}
          aria-label="Call us"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 border border-charcoal-3/20 text-charcoal-3 text-xs font-semibold shadow-2xs transition-all active:scale-95 no-underline"
        >
          <Phone className="w-3.5 h-3.5 text-charcoal-3/80 shrink-0" />
          <span>{COMPANY_NUMBER}</span>
        </Link>
      </div>
    </div>
  );
}

export default memo(FooterTopLeft);
