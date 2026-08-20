// types
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";

export const getContentPrice = ({
  price,
  city
}: {
  price?: ContentPriceDocument | any;
  city: CityDocument | null;
}): { price: number; mrp: number } => {
  if (!price) {
    return { mrp: 0, price: 0 };
  }

  // 1. Direct numeric price
  if (typeof price === "number") {
    return { mrp: price, price };
  }

  // 2. City-specific pricing
  if (city?._id && Array.isArray(price?.cities) && price.cities.length > 0) {
    const cityPrice = price.cities.find((c: any) => {
      const cityId = c?.city?._id || c?.city;
      return cityId && String(cityId) === String(city._id);
    });

    if (cityPrice) {
      const p = Number(cityPrice.price ?? cityPrice.sellingPrice ?? 0);
      const m = Number(cityPrice.mrp ?? cityPrice.regularPrice ?? p);
      if (p > 0 || m > 0) {
        return { mrp: m || p, price: p || m };
      }
    }
  }

  // 3. Nested under price.base
  if (price?.base && typeof price.base === "object") {
    const baseP = Number(price.base.price ?? price.base.sellingPrice ?? 0);
    const baseM = Number(price.base.mrp ?? price.base.regularPrice ?? baseP);
    if (baseP > 0 || baseM > 0) {
      return { mrp: baseM || baseP, price: baseP || baseM };
    }
  }

  // 4. Flat price object: { price: 1499, mrp: 1999 } or { sellingPrice, regularPrice }
  const directP = Number(price?.price ?? price?.sellingPrice ?? price?.amount ?? 0);
  const directM = Number(price?.mrp ?? price?.regularPrice ?? price?.originalPrice ?? directP);

  if (directP > 0 || directM > 0) {
    return { mrp: directM || directP, price: directP || directM };
  }

  return { mrp: 0, price: 0 };
};
