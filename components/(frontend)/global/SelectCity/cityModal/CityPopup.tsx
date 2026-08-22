"use client";

import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  MapPin,
  Search,
  X,
  Check,
  LocateFixed,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useLocation } from "@/hooks/useLocation/useLocation";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { POPULAR_CITIES, TIER_ONE_CITIES } from "@/common/constants/cities";
import { detectLocationApi } from "@/request/location/detectLocation";

const POPULAR_METROS = [
  "Ahmedabad",
  "Bangalore",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Jaipur",
  "Kolkata",
  "Mumbai",
  "Pune",
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
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input smoothly
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleSelectCity = useCallback(
    (cityName: string, cityObj?: CityDocument) => {
      if (cityObj) {
        onChangeCity(cityObj);
      } else {
        const found = cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (found) onChangeCity(found);
        else onChangeCity({ name: cityName } as CityDocument);
      }
      closeDialog?.();
    },
    [cities, onChangeCity, closeDialog]
  );

  // Detect current location via browser GPS or IP-based fallback
  const handleDetectLocation = useCallback(async () => {
    if (typeof window === "undefined") return;

    setIsLocating(true);
    setErrorMessage("");

    const applyDetectedLocation = (res: any): boolean => {
      if (res?.success && (res.city || res.cityName)) {
        const targetCity = res.city;
        const cityName = res.cityName || targetCity?.name;
        handleSelectCity(cityName, targetCity);
        return true;
      }
      return false;
    };

    const tryIpFallback = async () => {
      try {
        const ipRes = await detectLocationApi();
        if (!applyDetectedLocation(ipRes)) {
          setErrorMessage("Could not detect location. Please select your city.");
        }
      } catch {
        setErrorMessage("Could not detect location. Please select your city.");
      } finally {
        setIsLocating(false);
      }
    };

    // Try browser geolocation first if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const gpsRes = await detectLocationApi({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });

            if (!applyDetectedLocation(gpsRes)) {
              await tryIpFallback();
            } else {
              setIsLocating(false);
            }
          } catch {
            await tryIpFallback();
          }
        },
        async () => {
          // If user denies permission or GPS times out, fallback to IP detection
          await tryIpFallback();
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    } else {
      await tryIpFallback();
    }
  }, [handleSelectCity]);

  const allCityList = useMemo(() => {
    if (cities.length > 0) return cities;
    return POPULAR_CITIES.map(
      (name, i) =>
        ({ _id: `fallback-${i}`, name, isTopCity: true, state: "" }) as unknown as CityDocument
    );
  }, [cities]);

  const filteredCities = useMemo(() => {
    if (!keyword.trim()) {
      return allCityList.slice().sort((a, b) => a.name.localeCompare(b.name));
    }

    return allCityList
      .filter((city) =>
        city.name.toLowerCase().includes(keyword.toLowerCase().trim())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allCityList, keyword]);

  const isSearching = keyword.trim().length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-white text-zinc-900 select-none overflow-hidden text-left font-sans">
      {/* ── Top Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-[max(12px,env(safe-area-inset-top))] pb-3 sm:pt-4 sm:pb-3 border-b border-zinc-100 shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          {closeDialog && (
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Back"
              className="sm:hidden w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-[17px] sm:text-base font-bold text-zinc-900 leading-tight truncate">
            Select City
          </h2>
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

      {/* ── Search Input ───────────────────────────── */}
      <div className="px-5 py-3 shrink-0 border-b border-zinc-100 bg-white space-y-2.5">
        <div className="flex items-center gap-2.5 bg-zinc-100/80 rounded-xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-300">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Search for your city..."
            className="flex-1 bg-transparent text-[15px] sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                if (errorMessage) setErrorMessage("");
              }}
              aria-label="Clear search"
              className="w-5 h-5 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Detect Current Location */}
        {!isSearching && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="flex items-center gap-2 text-xs font-semibold text-[#b76e79] hover:text-[#96555f] py-0.5 cursor-pointer transition-colors active:scale-[0.99] disabled:opacity-75"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b76e79] shrink-0" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5 text-[#b76e79] shrink-0" />
              )}
              <span>
                {isLocating ? "Detecting location..." : "Use my current location"}
              </span>
            </button>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-medium animate-in fade-in duration-150">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Scrollable Body ────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-5 py-4 pb-[max(80px,calc(env(safe-area-inset-bottom)+50px))]">
        {/* 1. POPULAR CITIES (3-Column Grid with Pink Circle Pin Icons) */}
        {!isSearching && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              POPULAR CITIES
            </h3>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {POPULAR_METROS.map((cityName) => {
                const isSelected =
                  selectedCity?.name?.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleSelectCity(cityName)}
                    className={cn(
                      "flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border text-center transition-all active:scale-95 cursor-pointer min-h-[96px] gap-2.5",
                      isSelected
                        ? "bg-rose-50/50 border-[#b76e79] text-[#b76e79] shadow-2xs font-bold"
                        : "bg-white hover:bg-zinc-50 border-zinc-200/80 text-zinc-800 font-semibold hover:border-zinc-300"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-rose-100 text-[#b76e79]"
                          : "bg-rose-50 text-[#b76e79]"
                      )}
                    >
                      <MapPin className="w-4 h-4 text-[#b76e79]" />
                    </div>
                    <span className="text-[13px] sm:text-xs leading-tight truncate max-w-full">
                      {cityName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. ALL CITIES List */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            {isSearching ? `${filteredCities.length} CITIES FOUND` : "ALL CITIES"}
          </h3>

          {filteredCities.length > 0 ? (
            <div className="space-y-1">
              {filteredCities.map((city) => {
                const isSelected =
                  String(selectedCity?._id) === String(city._id) ||
                  selectedCity?.name?.toLowerCase() === city.name.toLowerCase();

                return (
                  <button
                    key={String(city._id)}
                    type="button"
                    onClick={() => handleSelectCity(city.name, city)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 px-3 rounded-xl text-left transition-all active:scale-[0.99] cursor-pointer",
                      isSelected
                        ? "bg-rose-50/70 text-[#b76e79] font-bold"
                        : "hover:bg-zinc-50 text-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <MapPin
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isSelected ? "text-[#b76e79]" : "text-zinc-400"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm truncate",
                          isSelected
                            ? "text-[#b76e79] font-bold"
                            : "text-zinc-800 font-medium"
                        )}
                      >
                        {city.name}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#b76e79] shrink-0 stroke-[2.5] ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center justify-center">
              <Search className="w-5 h-5 text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-700">
                No cities found matching &ldquo;{keyword}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-[#b76e79] bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
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
