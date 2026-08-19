"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CustomFAQ({
  q,
  a,
  qClassName,
  aClassName
}: {
  q: string | JSX.Element;
  a: string | JSX.Element;
  fullH?: string;
  condensedH?: string;
  qClassName?: string;
  aClassName?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        type="button"
        className={cn(
          "w-full py-3.5 px-3 flex items-center justify-between text-left transition-colors hover:bg-zinc-50 rounded-xl cursor-pointer",
          qClassName
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="text-[14px] font-semibold text-zinc-800">{q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0",
            open && "rotate-180 text-[#b76e79]"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "px-3 pb-3 pt-1 space-y-1 animate-in fade-in-50 duration-200",
            aClassName
          )}
        >
          {a}
        </div>
      )}
    </div>
  );
}
