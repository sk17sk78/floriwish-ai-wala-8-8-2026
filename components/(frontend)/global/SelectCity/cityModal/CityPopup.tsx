// icons
import { Flame, MapPin, Search, X } from "lucide-react";

// utils
import { memo, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

// hooks
import { useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useLocation } from "@/hooks/useLocation/useLocation";

// components
import { DrawerClose } from "@/components/ui/drawer";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";

// constants
import { POPULAR_CITIES } from "@/common/constants/cities";

const TOP_CITIES_CHIPS = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Pune",
];

function CityPopup({ closeDialog }: { closeDialog?: () => void }) {
  // hooks
  const {
    location: {
      data: { selectedCity },
      methods: { onChangeCity },
    },
  } = useAppStates();
  const { cities, status } = useLocation();

  const [keyword, setKeyword] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = useMemo(() => {
    // If we have API cities, use them.
    // Otherwise fallback to POPULAR_CITIES while loading.
    const cityList =
      cities.length > 0
        ? cities
        : POPULAR_CITIES.map(
            (name, index) =>
              ({
                _id: `fallback-${index}`,
                name,
                isTopCity: false,
                state: "",
              }) as unknown as CityDocument,
          );

    const list = cityList.filter((city) =>
      city.name.toLowerCase().includes(keyword.toLowerCase()),
    );
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, keyword]);

  return (
    <div className="flex flex-col h-full lg:max-h-[70vh]">
      {/* Mobile/Desktop Close Button */}
      <DrawerClose asChild>
        <button className="absolute -top-10 right-1/2 z-[997] translate-x-1/2 cursor-pointer rounded-full bg-black/30 p-1.5 text-white/80 active:scale-95 transition-all lg:top-3 lg:right-3 lg:translate-x-0 lg:bg-transparent lg:text-zinc-400 lg:hover:bg-zinc-100 lg:p-1 lg:scale-90">
          <X className="h-6 w-6 lg:h-5 lg:w-5" />
        </button>
      </DrawerClose>

      <div className="lg:hidden flex justify-center pt-4 pb-1 relative">
        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mb-2" />
      </div>

      {/* Header Section */}
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-5 pb-4 pt-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sienna-1/[0.07]">
          <MapPin strokeWidth={2} className="h-5 w-5 text-sienna-1" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-zinc-900">Select Your City</h3>
          <p className="text-[11px] text-zinc-400">Delivering to 500+ cities across India</p>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="shrink-0 px-5 py-3">
        <div className="relative flex items-center overflow-hidden rounded-2xl border-2 border-zinc-100 bg-zinc-50 transition-all duration-200 focus-within:border-sienna-1/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-sienna-1/10">
          <Search className="ml-3.5 h-4 w-4 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            className="w-full bg-transparent py-3 pr-10 pl-2.5 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
            placeholder="Search for your city…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Popular Cities Section (Mobile Only) */}
      {!keyword && (
        <div className="px-5 mb-4">
          <h3 className="mb-2.5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Popular Cities
          </h3>
          <div className="flex flex-wrap gap-2 pb-1 scrollbar-hide max-sm:flex-nowrap max-sm:overflow-x-auto">
            {TOP_CITIES_CHIPS.map((cityName) => (
              <button
                key={cityName}
                onClick={() => {
                  const city = cities.find((c) => c.name === cityName);
                  if (city) {
                    onChangeCity(city);
                    if (closeDialog) closeDialog();
                  } else {
                    onChangeCity({ name: cityName } as CityDocument);
                    if (closeDialog) closeDialog();
                  }
                }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all active:scale-95",
                  selectedCity?.name === cityName
                    ? "border-sienna-1 bg-sienna-1/5 text-sienna-1"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-sienna-1/40 hover:bg-sienna-1/5 hover:text-sienna-1 shadow-sm",
                )}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City List Section */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-ash/20 hover:scrollbar-thumb-ash/30 scrollbar-track-transparent">
        <div className="flex flex-col gap-1 pb-10">
          {filteredCities.length > 0 && (
            <h3 className="px-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              All Cities
            </h3>
          )}
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <DrawerClose key={index} asChild>
                <div
                  role="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-150 active:scale-[0.99] hover:bg-zinc-50 active:bg-zinc-100",
                    String(selectedCity?._id) === String(city._id) && "bg-sienna-1/5"
                  )}
                  onClick={() => {
                    onChangeCity(city);
                    if (closeDialog) closeDialog();
                  }}
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    String(selectedCity?._id) === String(city._id) ? "bg-sienna-1/10" : "bg-zinc-100"
                  )}>
                    <MapPin strokeWidth={2} className={cn("h-4 w-4", String(selectedCity?._id) === String(city._id) ? "text-sienna-1" : "text-zinc-400")} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn(
                      "truncate text-[13px] font-semibold transition-colors",
                      String(selectedCity?._id) === String(city._id) ? "text-sienna-1" : "text-zinc-800"
                    )}>
                      {city.name}
                    </span>
                  </div>
                  {city.isTopCity && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                        <Flame className="h-2.5 w-2.5 fill-current" />
                        Hot
                      </span>
                    </div>
                  )}
                </div>
              </DrawerClose>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-ash/60">
              <Search strokeWidth={1.5} className="w-10 h-10 opacity-20" />
              <p className="font-medium">No cities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CityPopup);
