"use client";

import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapPin, Search, X, Check, TrendingUp, Flame } from "lucide-react";
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

  // Immediate 1-click focus with preventScroll
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    const timer = setTimeout(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 100);

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
    <div className="flex flex-col h-full max-h-[85dvh] sm:max-h-[620px] w-full min-w-0 max-w-full bg-white text-zinc-900 overscroll-contain select-none overflow-hidden">
      {/* Drag handle for mobile */}
      <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
        <div className="w-12 h-1.5 rounded-full bg-zinc-200" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-2 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0 border border-rose-100/80">
            <MapPin className="w-5 h-5 text-[#b76e79]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-zinc-900 leading-tight truncate">
              Select Delivery City
            </h3>
            <p className="text-xs text-zinc-400 leading-tight mt-0.5 truncate">
              Instant delivery across 500+ cities in India
            </p>
          </div>
        </div>

        {closeDialog && (
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input Box */}
      <div className="px-4 sm:px-5 pb-3 shrink-0 w-full min-w-0">
        <div className="relative flex items-center w-full min-w-0 rounded-2xl border-2 border-rose-100 bg-white px-3 py-2.5 focus-within:border-[#b76e79] focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-2xs">
          <Search className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Type city name (e.g. Delhi, Mumbai, Pune)..."
            className="w-full min-w-0 bg-transparent text-[16px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none font-normal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              aria-label="Clear search"
              className="w-5 h-5 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center cursor-pointer shrink-0 ml-1.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 pb-6 overscroll-contain w-full min-w-0">
        {/* Popular Cities Chips (When search is empty) */}
        {!keyword.trim() && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-[#b76e79] fill-[#b76e79]" />
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Popular Metro Cities
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TOP_METRO_CITIES.map((cityName) => {
                const isSelected =
                  selectedCity?.name?.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleSelectCity(cityName)}
                    className={cn(
                      "flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer text-center min-w-0",
                      isSelected
                        ? "bg-rose-50 text-[#b76e79] border-[#b76e79] shadow-2xs font-bold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-[#b76e79]/40 hover:bg-rose-50/30"
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

        {/* City List / Matches */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              {keyword.trim()
                ? `${filteredCities.length} MATCHES`
                : "ALL DELIVERING CITIES"}
            </span>
          </div>

          {filteredCities.length > 0 ? (
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white overflow-hidden">
              {filteredCities.map((city) => {
                const isSelected =
                  String(selectedCity?._id) === String(city._id) ||
                  selectedCity?.name?.toLowerCase() === city.name.toLowerCase();

                const isTrending =
                  city.isTopCity ||
                  TIER_ONE_CITIES.some(
                    (c) => c.toLowerCase() === city.name.toLowerCase()
                  );

                return (
                  <div
                    key={String(city._id)}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectCity(city.name, city)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-3 transition-colors active:bg-zinc-100 hover:bg-rose-50/20 cursor-pointer min-w-0",
                      isSelected && "bg-rose-50/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "bg-[#b76e79] text-white"
                            : "bg-zinc-100 text-zinc-400"
                        )}
                      >
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={cn(
                            "text-[14px] font-semibold truncate",
                            isSelected ? "text-[#b76e79]" : "text-zinc-800"
                          )}
                        >
                          {city.name}
                        </span>
                        {city.state && (
                          <span className="text-[11px] text-zinc-400 truncate">
                            {typeof city.state === "string"
                              ? city.state
                              : (city.state as any)?.name || ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isTrending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                          <TrendingUp className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Trending</span>
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
              <Search className="w-8 h-8 opacity-30 text-[#b76e79]" />
              <p className="text-sm font-medium text-zinc-600">No matching cities found</p>
              <p className="text-xs text-zinc-400">Try searching for a different city</p>
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="mt-2 px-3 py-1.5 text-xs font-semibold text-[#b76e79] bg-rose-50 rounded-lg hover:bg-rose-100 cursor-pointer"
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
