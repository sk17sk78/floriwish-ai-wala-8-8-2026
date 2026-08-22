// next config
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCities } from "../controllers";
import { POPULAR_CITIES, TIER_ONE_CITIES } from "@/common/constants/cities";
import { type CityDocument } from "@/common/types/documentation/presets/city";

// Alias and normalized city mappings for Indian locations
const CITY_ALIASES_MAP: Record<string, string> = {
  bengaluru: "Bangalore",
  bangaluru: "Bangalore",
  "bangalore urban": "Bangalore",
  "bangalore rural": "Bangalore",
  gurugram: "Gurgaon",
  "gurugram district": "Gurgaon",
  "new delhi": "Delhi",
  "south delhi": "Delhi",
  "north delhi": "Delhi",
  "east delhi": "Delhi",
  "west delhi": "Delhi",
  "central delhi": "Delhi",
  "south west delhi": "Delhi",
  "north west delhi": "Delhi",
  "north east delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  "nct of delhi": "Delhi",
  delhi: "Delhi",
  "mumbai suburban": "Mumbai",
  "mumbai city": "Mumbai",
  bombay: "Mumbai",
  madras: "Chennai",
  chennai: "Chennai",
  calcutta: "Kolkata",
  kolkata: "Kolkata",
  "kolkata district": "Kolkata",
  secunderabad: "Hyderabad",
  hyderabad: "Hyderabad",
  "hyderabad district": "Hyderabad",
  "ranga reddy": "Hyderabad",
  rangareddy: "Hyderabad",
  "medchal–malkajgiri": "Hyderabad",
  "medchal-malkajgiri": "Hyderabad",
  medchal: "Hyderabad",
  "pimpri-chinchwad": "Pune",
  "pimpri chinchwad": "Pune",
  "pune district": "Pune",
  pune: "Pune",
  "gautam buddha nagar": "Noida",
  "greater noida": "Noida",
  noida: "Noida",
  ghaziabad: "Ghaziabad",
  faridabad: "Faridabad",
  "navi mumbai": "Navi Mumbai",
  thane: "Thane",
  ahmedabad: "Ahmedabad",
  "ahmedabad district": "Ahmedabad",
  jaipur: "Jaipur",
  "jaipur district": "Jaipur",
  chandigarh: "Chandigarh",
  lucknow: "Lucknow",
  prayagraj: "Prayagraj",
  allahabad: "Prayagraj",
  varanasi: "Varanasi",
  banaras: "Varanasi",
  kashi: "Varanasi",
  puducherry: "Pondicherry",
  pondicherry: "Pondicherry",
  cochin: "Kochi",
  kochi: "Kochi",
  ernakulam: "Kochi",
  trivandrum: "Thiruvananthapuram",
  thiruvananthapuram: "Thiruvananthapuram",
  mysuru: "Mysore",
  mysore: "Mysore",
  belagavi: "Belgaum",
  hubballi: "Hubli",
  hubli: "Hubli",
  manguluru: "Mangalore",
  mangaluru: "Mangalore",
  mangalore: "Mangalore",
  vishakhapatnam: "Visakhapatnam",
  vizag: "Visakhapatnam",
  visakhapatnam: "Visakhapatnam",
  vijayawada: "Vijayawada",
  vadodara: "Vadodara",
  baroda: "Vadodara",
  surat: "Surat",
  indore: "Indore",
  bhopal: "Bhopal",
  nagpur: "Nagpur",
  nashik: "Nashik",
  patna: "Patna",
  ludhiana: "Ludhiana",
  agra: "Agra",
  kanpur: "Kanpur",
  amritsar: "Amritsar",
  coimbatore: "Coimbatore",
  rajkot: "Rajkot",
  jabalpur: "Jabalpur",
  gwalior: "Gwalior",
  ranchi: "Ranchi",
  jodhpur: "Jodhpur",
  raipur: "Raipur",
  guwahati: "Guwahati",
  dehradun: "Dehradun",
};

interface LocationCandidate {
  cityName: string;
  state?: string;
  pincode?: string;
}

// Reverse Geocode using BigDataCloud + OpenStreetMap Nominatim
async function reverseGeocodeCoords(
  lat: number,
  lon: number
): Promise<LocationCandidate | null> {
  // 1. Try BigDataCloud (fast, highly reliable, generous rate limits)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );
    clearTimeout(timeoutId);

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city =
        bdcData?.city ||
        bdcData?.locality ||
        bdcData?.localityInfo?.administrative?.find(
          (a: any) =>
            a.description?.includes("city") ||
            a.description?.includes("district")
        )?.name ||
        "";

      if (city) {
        return {
          cityName: city,
          state: bdcData?.principalSubdivision || "",
          pincode: bdcData?.postcode || "",
        };
      }
    }
  } catch {
    // Continue to Nominatim fallback
  }

  // 2. Fallback to OpenStreetMap Nominatim with proper custom User-Agent
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "FloriwishApp/1.0 (contact@floriwish.com)",
          Accept: "application/json",
        },
      }
    );
    clearTimeout(timeoutId);

    if (osmRes.ok) {
      const osmData = await osmRes.json();
      const addr = osmData?.address || {};
      const city =
        addr.city ||
        addr.state_district ||
        addr.town ||
        addr.municipality ||
        addr.suburb ||
        addr.county ||
        addr.city_district ||
        addr.state ||
        "";

      if (city) {
        return {
          cityName: city,
          state: addr.state || "",
          pincode: addr.postcode || "",
        };
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}

// IP-based Geolocation fallback
async function geocodeByIp(ip: string): Promise<LocationCandidate | null> {
  const isLocalIp =
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.");

  // 1. Try ipwho.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const url = isLocalIp ? "https://ipwho.is/" : `https://ipwho.is/${ip}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.success !== false && data?.city) {
        return {
          cityName: data.city,
          state: data.region || "",
          pincode: data.postal || "",
        };
      }
    }
  } catch {
    // Continue
  }

  // 2. Try ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const url = isLocalIp ? "https://ipapi.co/json/" : `https://ipapi.co/${ip}/json/`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FloriwishApp/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.city && !data?.error) {
        return {
          cityName: data.city,
          state: data.region || "",
          pincode: data.postal || "",
        };
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}

// Resolve best match from DB cities or known lists
function matchCity(
  rawName: string,
  state: string | undefined,
  dbCities: CityDocument[]
): { matchedCity: CityDocument; matchedName: string } {
  const cleaned = rawName.trim().toLowerCase();

  // 1. Check alias dictionary
  const aliasTarget = CITY_ALIASES_MAP[cleaned];
  const searchTargets = [
    aliasTarget?.toLowerCase(),
    cleaned,
    // also try stripping common suffixes like "district", "city", "urban", "rural"
    cleaned.replace(/\s+(district|city|urban|rural|suburban)$/i, "").trim(),
  ].filter(Boolean) as string[];

  // 2. Search in DB cities
  for (const target of searchTargets) {
    // Exact match on DB city name
    const exact = dbCities.find(
      (c) => c.name.toLowerCase() === target
    );
    if (exact) return { matchedCity: exact, matchedName: exact.name };

    // Match on DB city aliases
    const aliasMatch = dbCities.find((c) =>
      c.aliases?.some((a) => a.toLowerCase() === target || a.toLowerCase().includes(target))
    );
    if (aliasMatch) return { matchedCity: aliasMatch, matchedName: aliasMatch.name };

    // Substring match in DB cities
    const sub = dbCities.find(
      (c) =>
        c.name.toLowerCase().includes(target) ||
        target.includes(c.name.toLowerCase())
    );
    if (sub) return { matchedCity: sub, matchedName: sub.name };
  }

  // 3. Search in popular & tier 1 cities list
  const knownCities = [...TIER_ONE_CITIES, ...POPULAR_CITIES];
  for (const target of searchTargets) {
    const known = knownCities.find(
      (kc) =>
        kc.toLowerCase() === target ||
        kc.toLowerCase().includes(target) ||
        target.includes(kc.toLowerCase())
    );
    if (known) {
      const cityDoc = {
        _id: `known-${known.toLowerCase()}`,
        name: known,
        isTopCity: true,
        state: state || "",
      } as unknown as CityDocument;
      return { matchedCity: cityDoc, matchedName: known };
    }
  }

  // 4. Default: Return resolved name as a city document
  const resolvedDisplayName =
    aliasTarget ||
    rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const fallbackDoc = {
    _id: `custom-${resolvedDisplayName.toLowerCase().replace(/\s+/g, "-")}`,
    name: resolvedDisplayName,
    isTopCity: false,
    state: state || "",
  } as unknown as CityDocument;

  return { matchedCity: fallbackDoc, matchedName: resolvedDisplayName };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat") || searchParams.get("latitude");
    const lonParam =
      searchParams.get("lon") ||
      searchParams.get("lng") ||
      searchParams.get("longitude");

    let locationCandidate: LocationCandidate | null = null;

    // 1. If GPS coordinates provided, reverse geocode
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        locationCandidate = await reverseGeocodeCoords(lat, lon);
      }
    }

    // 2. If no candidate yet, fallback to IP Geolocation
    if (!locationCandidate) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const clientIp =
        forwardedFor?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip") ||
        "";

      locationCandidate = await geocodeByIp(clientIp);
    }

    if (!locationCandidate || !locationCandidate.cityName) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not detect location",
        },
        { status: 404 }
      );
    }

    // 3. Match against DB cities
    const dbCities = (await getCities()) || [];
    const { matchedCity, matchedName } = matchCity(
      locationCandidate.cityName,
      locationCandidate.state,
      dbCities
    );

    return NextResponse.json({
      success: true,
      cityName: matchedName,
      city: matchedCity,
      state: locationCandidate.state || "",
      pincode: locationCandidate.pincode || "",
      rawDetected: locationCandidate.cityName,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
