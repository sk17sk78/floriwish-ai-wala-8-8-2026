import { normalizeRating } from "@/common/helpers/normalizeRating";

export const getRatingValue = (rating: number) =>
  normalizeRating(rating).toFixed(1);
