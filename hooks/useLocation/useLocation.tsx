/* eslint-disable react-hooks/exhaustive-deps */

"use client";

// libraries
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

// requests
import { fetchLocationData } from "@/request/location/locationData";

// types
import { type CityDocument } from "@/common/types/documentation/presets/city";

type Location = {
  onSearch: (keyword: string) => CityDocument[];
  cities: CityDocument[];
  status: "initial" | "idle" | "pending";
};

const Location = createContext<Location | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  // states
  const [status, setStatus] = useState<"initial" | "idle" | "pending">(
    "initial"
  );
  const [cities, setCities] = useState<CityDocument[]>([]);

  // event handlers
  const handleLoadData = () => {
    if (status === "initial") {
      setStatus("pending");

      fetchLocationData()
        .then(({ data: cities }) => {
          if (cities) {
            setCities(cities as CityDocument[]);

            setStatus("idle");
          }
        })
        .catch((error) => {
          setStatus("initial");
        });
    }
  };

  const handleSearch = (keyword: string): CityDocument[] => {
    const lowerKeyword = keyword.trim().toLowerCase();
    if (!lowerKeyword) return [];
    
    return cities.filter(city => {
      const matchName = city.name.toLowerCase().includes(lowerKeyword);
      const matchAlias = city.aliases?.some(alias => alias.toLowerCase().includes(lowerKeyword));
      return matchName || matchAlias;
    });
  };

  // side effects
  useEffect(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(handleLoadData, { timeout: 2500 });
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(idleId);
        }
      };
    } else {
      const timer = setTimeout(handleLoadData, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Location.Provider
      value={{
        onSearch: handleSearch,
        cities,
        status
      }}
    >
      {children}
    </Location.Provider>
  );
}

export const useLocation = (): Location => {
  const location = useContext(Location);

  if (!location) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return location;
};
