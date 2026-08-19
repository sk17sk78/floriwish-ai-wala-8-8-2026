"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { memo, useEffect, useState, useCallback } from "react";
import { type CityDocument } from "@/common/types/documentation/presets/city";

function SelectCityDesktop({
  selectedCity,
  onClick,
}: {
  selectedCity: CityDocument | null;
  onClick: () => void;
}) {
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    const handleShake = () => {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 600);
      return () => clearTimeout(timer);
    };

    window.addEventListener("shake-city-selector", handleShake);
    return () => {
      window.removeEventListener("shake-city-selector", handleShake);
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onClick();
    },
    [onClick]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Select Delivery City"
      className={`group relative text-charcoal-3/90 hidden sm:flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 transition-all duration-200 hover:-translate-y-px hover:border-[#b76e79]/40 hover:bg-rose-50/20 active:scale-95 cursor-pointer touch-manipulation select-none outline-none ${
        shouldShake ? "animate-shake border-red-500 shadow-md" : "border-zinc-200/80 shadow-2xs"
      }`}
    >
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200 shrink-0 ${
          shouldShake ? "bg-red-100" : "bg-rose-50 group-hover:bg-rose-100 text-[#b76e79]"
        }`}
      >
        <MapPin
          className={`w-3.5 h-3.5 ${shouldShake ? "text-red-500" : "text-[#b76e79]"}`}
          strokeWidth={2}
        />
      </div>
      <div className="flex flex-col text-left leading-tight pointer-events-none">
        <span
          className={`text-[10px] font-medium tracking-wide uppercase ${
            shouldShake ? "text-red-400" : "text-zinc-400"
          }`}
        >
          Deliver to
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`text-[13px] font-semibold tracking-tight ${
              shouldShake ? "text-red-600" : "text-zinc-900"
            }`}
          >
            {selectedCity ? selectedCity.name : "Select City"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              shouldShake ? "text-red-400" : "text-zinc-400 group-hover:translate-y-0.5"
            }`}
            strokeWidth={2}
          />
        </div>
      </div>
    </button>
  );
}

export default memo(SelectCityDesktop);
