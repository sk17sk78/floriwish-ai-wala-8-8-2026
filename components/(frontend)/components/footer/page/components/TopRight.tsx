"use client";

import React, { memo } from "react";
import Link from "next/link";
import { type FooterSectionDocument, type FooterSectionLinkDocument } from "../types";

function FooterTopRight({
  footerSections,
}: {
  footerSections: FooterSectionDocument[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 lg:gap-x-14 gap-y-6 text-left w-full">
      {footerSections.map((section, idx) => (
        <div key={section._id ? String(section._id) : idx} className="flex flex-col gap-2.5 sm:gap-3.5">
          <span className="text-[13px] min-[380px]:text-sm sm:text-base font-bold text-charcoal-3 capitalize tracking-tight">
            {section.heading}
          </span>

          <div className="flex flex-col gap-2 sm:gap-2.5">
            {section.links &&
              section.links.map((link: FooterSectionLinkDocument, lIdx: number) => (
                <Link
                  key={link._id ? String(link._id) : lIdx}
                  href={link.path}
                  prefetch={false}
                  className="text-xs min-[380px]:text-[13px] sm:text-sm md:text-[14px] text-charcoal-3/85 hover:text-sienna font-normal transition-colors leading-relaxed py-0.5"
                >
                  {link.label}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(FooterTopRight);
