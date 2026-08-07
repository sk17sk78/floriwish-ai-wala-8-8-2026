// utils
import { memo } from "react";

// components
import HeaderNavMenuQuickLink from "./HeaderNavMenuQuickLink";
import HeaderNavMenuSection from "./HeaderNavMenuSection";

// types
import { ClickableImageDocument } from "@/common/types/documentation/nestedDocuments/clickableImage";
import { HeaderNavLinkSectionDocument } from "@/common/types/documentation/nestedDocuments/headerNavLinkSection";

function HeaderNavMenuContent({
  sections,
  quickLinks,
}: {
  sections?: HeaderNavLinkSectionDocument[];
  quickLinks?: ClickableImageDocument[];
}) {
  return (
    <div
      className="w-min whitespace-nowrap p-5 outline-none rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-black/5"
      style={{
        display: "flex",
        gap: "48px",
      }}
    >
      {sections &&
        sections.length > 0 &&
        sections.map((section, index) => (
          <HeaderNavMenuSection
            // FIX: Added fallback to index if _id is undefined
            key={(String(section._id)) || `section-${index}`}
            section={section}
          />
        ))}
      <div className="grid grid-rows-2 grid-flow-col auto-cols-min gap-2.5">
        {quickLinks &&
          quickLinks.length > 0 &&
          quickLinks.map((quickLink, index) => (
            <HeaderNavMenuQuickLink
              // FIX: Added fallback to index if _id is undefined
              key={(String(quickLink._id)) || `quicklink-${index}`}
              quickLink={quickLink}
            />
          ))}
      </div>
    </div>
  );
}

export default memo(HeaderNavMenuContent);
