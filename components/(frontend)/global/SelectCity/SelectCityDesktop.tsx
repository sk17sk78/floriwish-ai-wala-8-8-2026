import { ChevronDown, MapPin } from "lucide-react";

// utils
import { memo, useEffect, useState } from "react";

// types
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

  return (
    <div
      className={`relative text-charcoal-3/90 flex items-center justify-start text-sm cursor-pointer ${
        shouldShake ? "animate-shake" : ""
      }`}
      onClick={onClick}
    >
      <div
        className={`group ml-1 hidden cursor-pointer items-center gap-2 rounded-full border bg-white px-3 py-1.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-[0_2px_8px_rgba(109,40,217,0.08)] sm:flex ${
          shouldShake ? "border-red-500 shadow-md" : "border-zinc-200/80"
        }`}
      >
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200 ${
            shouldShake ? "bg-red-100" : "bg-sienna-1/10 group-hover:bg-sienna-1/15"
          }`}
        >
          <MapPin
            width={16}
            height={16}
            strokeWidth={2}
            className={shouldShake ? "text-red-500" : "text-sienna-1"}
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span
            className={`text-[10px] font-medium tracking-wide uppercase ${
              shouldShake ? "text-red-400" : "text-zinc-500"
            }`}
          >
            Deliver to
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`text-[13px] font-semibold ${
                shouldShake ? "text-red-600" : "text-zinc-900"
              }`}
            >
              {selectedCity ? selectedCity.name : "Select City"}
            </span>
            <ChevronDown
              width={14}
              height={14}
              strokeWidth={2.5}
              className={shouldShake ? "text-red-400" : "text-charcoal-3/85"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SelectCityDesktop);
