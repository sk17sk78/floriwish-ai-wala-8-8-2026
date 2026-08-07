// utils
import { memo } from "react";

// components
import Link from "next/link";

// types
import { type ColorDocument } from "@/common/types/documentation/presets/color";
import { type HeaderNavLinkSectionDocument } from "@/common/types/documentation/nestedDocuments/headerNavLinkSection";
import { type PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";

function HeaderNavMenuSection({
  section: { heading, links },
}: {
  section: HeaderNavLinkSectionDocument;
}) {
  return (
    <div className="flex flex-col justify-start gap-1 items-start w-full">
      <span className="font-bold pb-2 text-zinc-500 text-[11px] uppercase tracking-[0.08em] px-3">
        {heading}
      </span>
      {/* FIX: Grab the index from the map function */}
      {links.map(({ _id, label, path, tag }: any, index: number) => (
        <Link
          // FIX: Added fallback to index if _id is undefined
          key={(String(_id)) || `link-${index}`}
          href={path || "#"}
          prefetch={false}
          className="transition-all duration-300 cursor-pointer hover:bg-pink-50 rounded-md hover:text-moss text-zinc-600 w-full text-[14px] font-normal flex items-center justify-start gap-2 py-1.5 px-3"
        >
          <span>{label}</span>
          {tag && (
            <span
              style={{
                background: (
                  (tag as PromotionTagDocument).color as ColorDocument
                ).hexCode,
              }}
              className={`text-white text-[9px] uppercase leading-none tracking-wide rounded-full px-2.5 py-1`}
            >
              {(tag as PromotionTagDocument).name}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

export default memo(HeaderNavMenuSection);
