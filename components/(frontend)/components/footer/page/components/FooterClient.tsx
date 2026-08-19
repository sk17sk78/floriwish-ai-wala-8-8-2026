"use client";

import React, { memo } from "react";
import FooterBottomLeft from "./BottomLeft";
import FooterBottomRight from "./BottomRight";
import FooterTopLeft from "./TopLeft";
import FooterTopRight from "./TopRight";
import FooterAppInstall from "./FooterAppInstall";
import { FooterSectionDocument } from "../types";

function FooterClient({
  footerSections,
}: {
  footerSections: FooterSectionDocument[];
}) {
  return (
    <footer className="w-full bg-[#fffdf9] border-t border-charcoal-3/15 pt-8 pb-16 sm:pt-12 sm:pb-12 md:pt-14 md:pb-14 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Logo/Contacts on Left + 2 Link Columns on Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 pb-8 sm:pb-10">
          {/* Column 1: Logo & Contacts (Left 5 of 12 cols on desktop) */}
          <div className="md:col-span-5 lg:col-span-5">
            <FooterTopLeft />
          </div>

          {/* Column 2: The 2 Link Sections - Company & Terms (Right 7 of 12 cols on desktop) */}
          <div className="md:col-span-7 lg:col-span-7">
            <FooterTopRight footerSections={footerSections} />
          </div>
        </div>

        {/* ── App Install Section (Google Play / App Store / Laptop) ── */}
        <div className="border-t border-charcoal-3/15 py-6 my-2">
          <FooterAppInstall />
        </div>

        {/* Bottom Symmetrical Divider */}
        <div className="border-t border-charcoal-3/15 pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-5">
          {/* Copyright on Left */}
          <FooterBottomRight />

          {/* Social Icons on Right */}
          <FooterBottomLeft />
        </div>
      </div>
    </footer>
  );
}

export default memo(FooterClient);
