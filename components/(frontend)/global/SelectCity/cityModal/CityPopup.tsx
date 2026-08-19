"use client";

import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapPin, Search, X, Check, Building2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useLocation } from "@/hooks/useLocation/useLocation";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { TIER_ONE_CITIES } from "@/common/constants/cities";

const TOP_METRO_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Noida",
];

function CityPopup({ closeDialog }: { closeDialog?: () => void }) {
  const {
    location: {
      data: { selectedCity },
      methods: { onChangeCity },
    },
  } = useAppStates();
  const { cities } = useLocation();

  const [keyword, setKeyword] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Immediate 1-click focus on all devices without layout jump
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    });

    const timer = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 120);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  const handleSelectCity = useCallback(
    (cityName: string, cityObj?: CityDocument) => {
      if (cityObj) {
        onChangeCity(cityObj);
      } else {
        const found = cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (found) {
          onChangeCity(found);
        } else {
          onChangeCity({ name: cityName } as CityDocument);
        }
      }
      if (closeDialog) {
        closeDialog();
      }
    },
    [cities, onChangeCity, closeDialog]
  );

  const filteredCities = useMemo(() => {
    const cityList =
      cities.length > 0
        ? cities
        : TIER_ONE_CITIES.map(
            (name, index) =>
              ({
                _id: `fallback-${index}`,
                name,
                isTopCity: true,
                state: "",
              }) as unknown as CityDocument
          );

    if (!keyword.trim()) {
      const tier1Set = new Set(TIER_ONE_CITIES.map((c) => c.toLowerCase()));
      const tier1List = cityList.filter(
        (city) => city.isTopCity || tier1Set.has(city.name.toLowerCase())
      );

      return (tier1List.length > 0 ? tier1List : cityList.slice(0, 20)).sort(
        (a, b) => a.name.localeCompare(b.name)
      );
    }

    return cityList
      .filter((city) =>
        city.name.toLowerCase().includes(keyword.toLowerCase().trim())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, keyword]);

  return (
    <div className="flex flex-col h-full max-h-[85dvh] sm:max-h-[600px] w-full bg-white text-zinc-900 overscroll-contain select-none">
      {/* Drag indicator for mobile bottom sheet */}
      <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full bg-zinc-300" />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-3 shrink-0 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0 border border-rose-100">
            <MapPin className="w-5 h-5 text-[#b76e79]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 leading-tight">
              Select Delivery City
            </h3>
            <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
              Instant delivery across 500+ cities in India
            </p>
          </div>
        </div>

        {closeDialog && (
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input Box (16px font prevents iOS Safari auto-zoom) */}
      <div className="px-5 py-3 shrink-0 bg-white">
        <div className="relative flex items-center w-full rounded-xl bg-zinc-100 border border-zinc-200/80 focus-within:border-[#b76e79] focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <Search className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Type city name (e.g. Delhi, Mumbai, Pune)..."
            className="w-full bg-transparent py-2.5 pl-2.5 pr-9 text-[16px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              aria-label="Clear search"
              className="absolute right-2.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 overscroll-contain">
        {/* Popular Cities Chips (Only when search is empty) */}
        {!keyword.trim() && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Popular Metro Cities
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TOP_METRO_CITIES.map((cityName) => {
                const isSelected =
                  selectedCity?.name?.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleSelectCity(cityName)}
                    className={cn(
                      "flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer text-center",
                      isSelected
                        ? "bg-rose-50 text-[#b76e79] border-[#b76e79] shadow-2xs font-bold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    )}
                  >
                    <span className="truncate">{cityName}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#b76e79] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* City List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              {keyword.trim() ? `Search Results (${filteredCities.length})` : "All Delivering Cities"}
            </span>
          </div>

          {filteredCities.length > 0 ? (
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white overflow-hidden">
              {filteredCities.map((city) => {
                const isSelected =
                  String(selectedCity?._id) === String(city._id) ||
                  selectedCity?.name?.toLowerCase() === city.name.toLowerCase();

                return (
                  <div
                    key={String(city._id)}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectCity(city.name, city)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-3 transition-colors active:bg-zinc-100 hover:bg-zinc-50 cursor-pointer",
                      isSelected && "bg-rose-50/70"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium",
                          isSelected
                            ? "bg-[#b76e79] text-white"
                            : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={cn(
                            "text-[13px] font-semibold truncate",
                            isSelected ? "text-[#b76e79]" : "text-zinc-800"
                          )}
                        >
                          {city.name}
                        </span>
                        {city.state && (
                          <span className="text-[11px] text-zinc-400 truncate">
                            {typeof city.state === "string" ? city.state : (city.state as any)?.name || ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(city.isTopCity || TIER_ONE_CITIES.some((c) => c.toLowerCase() === city.name.toLowerCase())) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200/60 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                          <Flame className="w-3 h-3 fill-orange-500 text-orange-500 shrink-0" />
                          <span>Hot</span>
                        </span>
                      )}

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#b76e79] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium text-zinc-600">No matching cities found</p>
              <p className="text-xs text-zinc-400">Try searching for a different city or check spelling</p>
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-[#b76e79] bg-rose-50 rounded-lg hover:bg-rose-100"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CityPopup);
