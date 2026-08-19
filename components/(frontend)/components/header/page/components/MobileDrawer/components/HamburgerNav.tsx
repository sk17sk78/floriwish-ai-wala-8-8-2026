"use client";

import { memo } from "react";
import { HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";
import Link from "next/link";
import CustomFAQ from "./CustomFAQ";
import { ChevronRight } from "lucide-react";
import { PromotionTagDocument } from "@/common/types/documentation/presets/promotionTag";
import { ColorDocument } from "@/common/types/documentation/presets/color";

function HamburgerNav({
  navLinks,
  close
}: {
  navLinks: HeaderNavLinkDocument[];
  close: () => void;
}) {
  if (!navLinks?.length) return null;

  return (
    <div className="py-2 border-b border-zinc-100 divide-y divide-zinc-100">
      {navLinks.map((navLink, index) =>
        navLink.path ? (
          <Link
            key={index}
            href={navLink.path}
            onClick={close}
            className="py-3 px-1 flex items-center justify-between transition-colors hover:text-[#b76e79] cursor-pointer"
          >
            <span className="text-[15px] font-medium text-zinc-800">
              {navLink.label}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </Link>
        ) : (
          <CustomFAQ
            key={index}
            q={navLink.label}
            qClassName="!px-1 !py-3 hover:bg-transparent"
            aClassName="!px-2 !pb-2"
            a={
              <div className="space-y-3 pt-1">
                {navLink.sections?.map(({ heading, links }: any, sIndex: number) => (
                  <div key={sIndex} className="space-y-1">
                    {heading && (
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                        {heading}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {links.map((link: any, lIndex: number) => (
                        <Link
                          key={lIndex}
                          onClick={close}
                          href={link.path}
                          className="flex items-center justify-between py-2 px-2 rounded-md text-[13px] text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                        >
                          <span>{link.label}</span>
                          {link?.tag && (
                            <span
                              style={{
                                background: (
                                  (link?.tag as PromotionTagDocument)
                                    ?.color as ColorDocument
                                )?.hexCode || "#b76e79"
                              }}
                              className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                            >
                              {(link.tag as PromotionTagDocument)?.name || "NEW"}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        )
      )}
    </div>
  );
}

export default memo(HamburgerNav);
