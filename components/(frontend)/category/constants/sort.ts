// types
import { type CategoryPageSort } from "../types/sort";

export const CATEGORY_PAGE_SORT_OPTIONS: {
  label: string;
  value: CategoryPageSort;
}[] = [
  { label: "Most Popular", value: "popularity" },
  { label: "Latest Arrivals", value: "latest" },
  { label: "Price: Low to High", value: "low-to-high" },
  { label: "Price: High to Low", value: "high-to-low" }
];
