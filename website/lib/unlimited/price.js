// Synthetic-unlimited pricing (fulfilled by the EA auto-refill engine).
//
// Per destination D over N days:
//   price = max( bytesimTotal(D, N) − $0.10 ,  floorUsd(D, N) )
//
// The anchor undercuts bytesim's real N-day 2GB/day total by 10¢. The floor is the
// MINIMUM sale price and is computed by the caller via one of the floor*() helpers:
//   • floorFrom2GBDayUsd  — min price = EA's own "2GB/Day" catalog price × N
//     (never sell unlimited below what EA charges to deliver the 2GB/day fair-use).
//   • floorFromTopupCostUsd — 2× profit on the cheap total-data top-up cost.
// max() takes whichever is higher: we undercut bytesim when we can, but never below
// the floor. Only list a destination where the anchor wins (else floor > bytesim).

export const PROFIT_USAGE_GB_PER_DAY = 2.0; // fair-use cap the floor is priced for
export const PROFIT_MULTIPLE = 2;
export const UNDERCUT_USD = 0.1;

/** EA bucket we load up front, by duration (then top up as they consume). */
export function initialLoadGb(days) {
  if (days <= 1) return 3;
  if (days <= 5) return 5;
  if (days <= 7) return 10;
  return 20;
}

/** Min price = EA's "2GB/Day" daily-plan price held for the whole duration. */
export function floorFrom2GBDayUsd(ea2gbDayUsd, days) {
  return ea2gbDayUsd * days;
}

/** Min price = 2× profit on the cheap total-data top-up cost of the fair-use bundle. */
export function floorFromTopupCostUsd(costPerGbUsd, days) {
  return PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY * costPerGbUsd * days;
}

/**
 * @param {{ days:number, competitorTotalsUsd:number[], floorUsd:number }} p
 *   competitorTotalsUsd = competitors' 2GB/day TOTAL prices for this exact N-day duration.
 *   floorUsd = the minimum sale price for the whole N-day plan (see floor*() helpers).
 * @returns {{ priceUsd:number, anchorUsd:number|null, floorUsd:number, source:"competitor"|"floor" }}
 */
export function unlimitedPriceUsd({ days, competitorTotalsUsd = [], floorUsd }) {
  const valid = competitorTotalsUsd.filter((x) => x > 0);
  const anchorUsd = valid.length ? Math.min(...valid) - UNDERCUT_USD : null;
  const useAnchor = anchorUsd != null && anchorUsd >= floorUsd;
  return {
    priceUsd: useAnchor ? anchorUsd : floorUsd,
    anchorUsd,
    floorUsd,
    source: useAnchor ? "competitor" : "floor",
  };
}

/**
 * Viable to LIST as unlimited competitively for an N-day plan: the price ends up on
 * the competitor (we undercut AND stay above the floor), not pinned to the floor.
 * Returns null without competitor data.
 */
export function isUnlimitedViable({ days, competitorTotalsUsd = [], floorUsd }) {
  if (!competitorTotalsUsd.some((x) => x > 0)) return null;
  return unlimitedPriceUsd({ days, competitorTotalsUsd, floorUsd }).source === "competitor";
}
