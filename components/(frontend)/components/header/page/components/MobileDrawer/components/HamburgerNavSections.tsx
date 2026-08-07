// utils
import { memo } from "react";

// components
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import HamburgerNavSectionLink from "./HamburgerNavSectionLink";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

function HamburgerNavSections({
  navLink: { _id, label, sections }
}: {
  navLink: HeaderNavLinkDocument;
}) {
  return (
    <AccordionItem value={String(_id)}>
      <AccordionTrigger className="text-base py-3.5 px-1 font-normal hover:no-underline cursor-pointer transition-all duration-300">
        <div className="flex items-center justify-start gap-2.5">
          <span>{label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-transparent pb-1">
        {sections?.map(({ heading, links }: any, index: number) => (
          <div
            key={index}
            className="flex flex-col gap-1 py-2 px-1"
          >
            <span className="text-[17px] text-charcoal-3 underline underline-offset-4 py-1.5">
              {heading}
            </span>
            {links.map((link: any) => (
              <HamburgerNavSectionLink
                key={String(link._id)}
                link={link}
              />
            ))}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

export default memo(HamburgerNavSections);
