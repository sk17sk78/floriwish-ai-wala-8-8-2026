"use client";

import { useAppStates } from "@/hooks/useAppState/useAppState";
import { ChevronRight, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { memo, useEffect, useState } from "react";

function ContentDetailCityCard({ isAvailable }: { isAvailable: boolean }) {
  const {
    location: {
      data: { selectedCity },
      methods: { onToggleShowCitySelector },
    },
  } = useAppStates();

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

  const handleOpenCitySelector = () => {
    onToggleShowCitySelector(true);
  };

  return (
    <div
      onClick={handleOpenCitySelector}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md ${
        shouldShake
          ? "animate-shake border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          : "border-zinc-100"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
          shouldShake ? "bg-red-50 text-red-500" : "bg-sienna-2/10 text-moss"
        }`}
      >
        <MapPin
          width={17}
          className={shouldShake ? "fill-red-500/10" : "fill-moss/10"}
        />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3
            className={`text-[13px] font-semibold transition-colors duration-300 ${
              shouldShake ? "text-red-600" : "text-zinc-700"
            }`}
          >
            {selectedCity ? (
              <span className="flex items-center gap-1.5">
                Deliver to:{" "}
                <span className="text-sienna-1">{selectedCity.name}</span>
                {isAvailable ? (
                  <CheckCircle2
                    width={14}
                    height={14}
                    className="fill-emerald-500 text-white"
                  />
                ) : (
                  <XCircle
                    width={14}
                    height={14}
                    className="fill-red-500 text-white"
                  />
                )}
              </span>
            ) : (
              "Select Your City"
            )}
          </h3>
        </div>
        <span
          className={`text-[11px] transition-colors duration-300 ${
            shouldShake ? "text-red-400 font-medium" : "text-zinc-400"
          }`}
        >
          {shouldShake
            ? "Please select your city for delivery"
            : selectedCity
              ? isAvailable
                ? "Available in your city"
                : "Not available in your city"
              : "We deliver to 500+ cities across India"}
        </span>
      </div>
      <ChevronRight
        width={20}
        className={`transition-colors duration-300 ${
          shouldShake ? "text-red-300" : "text-zinc-300"
        }`}
      />
    </div>
  );
}

export default memo(ContentDetailCityCard);
