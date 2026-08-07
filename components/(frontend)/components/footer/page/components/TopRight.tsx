// utils
import { memo } from "react";

// components
import Link from "next/link";

// type
import { type FooterSectionDocument, type FooterSectionLinkDocument } from "../types";

function FooterTopRight({
  footerSections: footerSections
}: {
  footerSections: FooterSectionDocument[];
}) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 items-start justify-start gap-x-6 sm:gap-x-1 md:gap-x-4 lg:gap-x-14 gap-y-8 text-charcoal-3 pb-5 sm:pb-12 max-sm:px-1">
      {footerSections.map(({ _id, heading, links }: FooterSectionDocument) => (
        <div
          key={String(_id)}
          className="flex flex-col items-start md:items-start justify-start gap-2"
        >
          <span className="font-semibold capitalize mb-1 text-sm sm:text-[11px] md:text-[12px] lg:text-base">
            {heading}
          </span>
          <div className="flex flex-col items-start md:items-start justify-start gap-3 text-charcoal-3/85">
            {links &&
              links.map(({ _id, label, path }: FooterSectionLinkDocument) => (
                <Link
                  key={String(_id)}
                  href={path}
                  prefetch={false}
                  className={`transition-all duration-300 text-charcoal-3 hover:text-sienna text-[13px] sm:text-[10px] md:text-[11px] lg:text-sm`}
                >
                  {label}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default memo(FooterTopRight);
