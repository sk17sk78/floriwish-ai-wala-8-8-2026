// icons
import { ChevronRight } from "lucide-react";

// constants
import { CONTACT_LINKS } from "../constants/contactLinks";

// utils
import { memo } from "react";

// components
import BoxTheme from "@/components/(frontend)/content/theme/BoxTheme";
import { cn } from "@/lib/utils";
import Link from "next/link";

function HamburgerContact({ onClose }: { onClose?: () => void }) {
  return (
    <section className="flex flex-col border-t border-black/10">
      {CONTACT_LINKS.map(({ label, link, svg, rightSide }, index) => (
        <Link
          href={link}
          prefetch={false}
          onClick={onClose}
          className="flex items-center justify-between px-4 py-4 transition-all duration-300 hover:bg-black/5 border-b border-black/10 group"
          key={index}
        >
          <div className="flex items-center gap-4">
            <div className="text-charcoal-3/80 group-hover:text-sienna transition-colors">
              {svg}
            </div>
            <span className="text-[15px] font-medium text-charcoal-3">
              {label}
            </span>
          </div>
          {rightSide && (
            <span className={cn("text-xs font-semibold uppercase tracking-wider", rightSide.color)}>
              {rightSide.label}
            </span>
          )}
        </Link>
      ))}
    </section>
  );
}

export default memo(HamburgerContact);
