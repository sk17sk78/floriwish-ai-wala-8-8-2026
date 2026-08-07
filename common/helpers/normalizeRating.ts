/**
 * Normalizes a rating value to a 0-5 scale.
 * Handles cases where ratings are stored as:
 * - 0-5 (direct)
 * - 0-10 (multiplied by 2 or stored out of 10)
 * - 0-50 (multiplied by 10)
 * - 0-100 (percentage based)
 * 
 * Logic:
 * - If > 10:
 *   - If r/10 <= 5: assume Rating * 10 (0-50 scale). Divide by 10.
 *   - Else: assume 0-100 scale. Divide by 20.
 * - Else if > 5: assume 0-10 scale. Divide by 2.
 * - Else: assume 0-5 scale.
 */
export const normalizeRating = (rating: number): number => {
  if (!rating || isNaN(rating)) return 0;
  
  let normalized = rating;
  if (rating > 10) {
    if (rating / 10 <= 5) {
      normalized = rating / 10;
    } else {
      normalized = rating / 20;
    }
  } else if (rating > 5) {
    normalized = rating / 2;
  }
  
  // Cap at 5.0 and ensure it's not negative
  return Math.min(5, Math.max(0, normalized));
};
