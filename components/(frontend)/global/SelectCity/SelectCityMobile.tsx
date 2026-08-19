"use client";

// icons
import { ChevronDown, MapPin } from "lucide-react";

// utils
import { memo, useEffect, useState, useCallback } from "react";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";

function SelectCityMobile({
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
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      aria-label="Select Delivery City"
      className={`relative w-full lg:hidden px-4 py-2 z-20 transition-all duration-200 cursor-pointer select-none touch-manipulation active:opacity-90 ${
        shouldShake
          ? "animate-shake bg-red-50 text-red-500"
          : "bg-sienna-2/10 hover:bg-sienna-2/15 text-moss"
      }`}
    >
      <div className="flex items-center justify-between gap-2 w-full pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin
            className={`w-3.5 h-3.5 shrink-0 ${
              shouldShake ? "text-red-500" : "text-moss"
            }`}
            strokeWidth={2.5}
          />
          <span
            className={`text-xs text-left font-medium tracking-tight truncate ${
              shouldShake ? "text-red-600" : "text-zinc-600"
            }`}
          >
            Deliver to{" "}
            <span
              className={`font-bold ${
                shouldShake ? "text-red-700" : "text-moss"
              }`}
            >
              {selectedCity ? selectedCity.name : "Choose city"}
            </span>
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            shouldShake ? "text-red-400" : "text-zinc-600"
          }`}
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
}

export default memo(SelectCityMobile);
