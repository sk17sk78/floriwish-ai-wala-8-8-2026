"use client";

import { CONTACT_LINKS } from "../constants/contactLinks";
import { memo } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function HamburgerContact({ onClose }: { onClose?: () => void }) {
  return (
    <div className="py-2">
      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 px-1">
        Help & Support
      </p>
      <div className="divide-y divide-zinc-100">
        {CONTACT_LINKS.map(({ label, link, svg, rightSide }, index) => (
          <Link
            href={link}
            prefetch={false}
            onClick={onClose}
            className="flex items-center justify-between py-3 px-1 transition-colors hover:text-[#b76e79] cursor-pointer"
            key={index}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-zinc-500 shrink-0">
                {svg}
              </div>
              <span className="text-[13.5px] font-medium text-zinc-700 truncate">
                {label}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {rightSide && (
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100",
                    rightSide.color
                  )}
                >
                  {rightSide.label}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default memo(HamburgerContact);
