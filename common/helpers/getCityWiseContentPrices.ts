import { ContentDocument } from "../types/documentation/contents/content";
import { ContentPriceDocument } from "../types/documentation/nestedDocuments/contentPrice";
import { CityDocument } from "../types/documentation/presets/city";

export const getCityWiseContentPrices = ({
  city,
  content
}: {
  content?: ContentDocument | any;
  city: CityDocument | null;
}): { price: number; mrp: number } => {
  if (!content) {
    return { mrp: 0, price: 0 };
  }

  const priceObj = content.price || content;
  return getCityWisePrices({ city, prices: priceObj });
};

export const getCityWisePrices = ({
  city,
  prices
}: {
  city: CityDocument | null;
  prices: ContentPriceDocument | any;
}): { price: number; mrp: number } => {
  if (prices === undefined || prices === null) return { mrp: 0, price: 0 };

  // Direct numeric
  if (typeof prices === "number") {
    return { mrp: prices, price: prices };
  }

  // City-wise match
  if (
    city?._id &&
    Array.isArray(prices.cities) &&
    prices.cities.length > 0
  ) {
    const targetCityPrices = prices.cities.find((c: any) => {
      const cityId = c?.city?._id || c?.city;
      return cityId && String(cityId) === String(city._id);
    });

    if (targetCityPrices) {
      const p = Number(targetCityPrices.price ?? targetCityPrices.sellingPrice ?? 0);
      const m = Number(targetCityPrices.mrp ?? targetCityPrices.regularPrice ?? p);
      if (p > 0 || m > 0) {
        return { mrp: m || p, price: p || m };
      }
    }
  }

  // Base object match
  if (prices.base && typeof prices.base === "object") {
    const baseP = Number(prices.base.price ?? prices.base.sellingPrice ?? 0);
    const baseM = Number(prices.base.mrp ?? prices.base.regularPrice ?? baseP);
    if (baseP > 0 || baseM > 0) {
      return { mrp: baseM || baseP, price: baseP || baseM };
    }
  }

  // Direct flat price match { price, mrp }
  const flatP = Number(prices.price ?? prices.sellingPrice ?? prices.amount ?? 0);
  const flatM = Number(prices.mrp ?? prices.regularPrice ?? prices.originalPrice ?? flatP);

  if (flatP > 0 || flatM > 0) {
    return { mrp: flatM || flatP, price: flatP || flatM };
  }

  return { mrp: 0, price: 0 };
};
