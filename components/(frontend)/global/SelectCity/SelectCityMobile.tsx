// icons
import { ArrowRight, ChevronDown, MapPinIcon } from "lucide-react";

// utils
import { memo, useEffect, useState } from "react";

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

  return (
    <div
      className={`relative w-full lg:hidden px-4 py-1.5 z-20 transition-all duration-300 ${
        shouldShake
          ? "animate-shake bg-red-50 text-red-500"
          : "bg-sienna-2/10 hover:bg-sienna-2/15 text-moss"
      }`}
    >
      <div
        className="relative flex items-center justify-start text-sm cursor-pointer w-full group"
        onClick={onClick}
      >
        <div className={"flex items-center justify-start gap-2 w-full"}>
          <MapPinIcon
            width={14}
            strokeWidth={2.5}
            className={shouldShake ? "text-red-500" : "text-moss"}
          />
          <span
            className={`text-[12px] text-left font-medium tracking-tight ${
              shouldShake ? "text-red-600" : "text-zinc-600"
            }`}
          >
            Deliver to{" "}
            <span className={shouldShake ? "text-red-700 font-bold" : "text-moss font-bold"}>
              {selectedCity ? selectedCity.name : "Choose city"}
            </span>
          </span>
          <ChevronDown
            width={14}
            strokeWidth={2.5}
            className={`ml-auto transition-colors ${
              shouldShake ? "text-red-400" : "text-zinc-600 group-hover:text-moss"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(SelectCityMobile);
