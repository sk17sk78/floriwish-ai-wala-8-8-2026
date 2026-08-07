// utils
import { memo } from "react";

// components
import FooterBottomLeft from "./BottomLeft";
import FooterBottomRight from "./BottomRight";
import FooterTopLeft from "./TopLeft";
import FooterTopRight from "./TopRight";
import WidthWrapper from "../../../wrapper/WidthWrapper";

// type
import { FooterSectionDocument } from "../types";

async function FooterClient({
  footerSections
}: {
  footerSections: FooterSectionDocument[];
}) {
  return (
    <footer
      className={`relative overflow-hidden flex-none flex h-fit bg-[#fffdf9] px-3 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-8 border-t border-charcoal-3/10 md:pb-8 1200:px-0 text-white lg:-mb-44`}
    >
      <WidthWrapper className={`z-20`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-y-10 sm:gap-x-1 md:gap-x-4 lg:gap-x-12">
          {/* Column 1: Logo & Contact Details */}
          <div className="sm:col-span-1">
            <FooterTopLeft />
          </div>

          {/* Columns 2-4: Useful Links */}
          <div className="sm:col-span-3">
            <FooterTopRight footerSections={footerSections} />
          </div>

          {/* Symmetrical Bottom Section with clean divider */}
          <div className="col-span-full border-t border-charcoal-3/10 mt-2"></div>
          
          <div className="sm:col-span-2 flex items-center justify-center sm:justify-start pt-4">
            <FooterBottomRight />
          </div>
          <div className="sm:col-span-2 flex items-center justify-center sm:justify-end pt-2 sm:pt-4">
            <FooterBottomLeft />
          </div>
        </div>
      </WidthWrapper>
    </footer>
  );
}

export default memo(FooterClient);
