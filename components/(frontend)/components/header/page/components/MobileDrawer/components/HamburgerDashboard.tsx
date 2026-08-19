"use client";

import { memo } from "react";
import { DASHBOARD_LINKS } from "../constants/dashboardLinks";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function HamburgerDashboard({
  isAuthenticated,
  onClose
}: {
  isAuthenticated: boolean;
  onClose: () => void;
}) {
  if (!isAuthenticated) return null;

  return (
    <div className="py-2 border-b border-zinc-100">
      {DASHBOARD_LINKS.map(({ label, link, svg }, index) => (
        <Link
          key={index}
          href={link}
          prefetch={false}
          onClick={onClose}
          className="flex items-center justify-between py-2.5 px-1 text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-[#b76e79]">{svg}</div>
            <span>{label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-300" />
        </Link>
      ))}
    </div>
  );
}

export default memo(HamburgerDashboard);
