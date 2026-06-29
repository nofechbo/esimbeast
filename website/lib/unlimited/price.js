// Synthetic-unlimited pricing (fulfilled by the EA auto-refill engine).
//
// Per destination D over N days:
//   price = max( bytesim2GBday(D)/day · N − $0.10 ,  5 · costPerGb(D) · N )
//
// The floor term 5·c·N = 2 × (2.5 GB/day × N × c) = 2× profit even at 2.5 GB/day
// usage. The anchor undercuts bytesim's N-day 2GB/day total by 10¢. max() takes
// whichever is higher: we undercut bytesim when we can, but never sell below 2×
// cost. Only list a destination as unlimited where the anchor wins (otherwise the
// floor prices us above bytesim — profitable but not competitive).

export const PROFIT_USAGE_GB_PER_DAY = 2.5; // price for this even though we fulfil ~2/day
export const PROFIT_MULTIPLE = 2;
export const UNDERCUT_USD = 0.1;

/** EA bucket we load up front, by duration (then top up as they consume). */
export function initialLoadGb(days) {
  if (days <= 1) return 3;
  if (days <= 5) return 5;
  if (days <= 7) return 10;
  return 20;
}

/**
 * @param {{ days:number, competitorTotalsUsd:number[], eaCostPerGbUsd:number }} p
 *   competitorTotalsUsd = competitors' 2GB/day TOTAL prices for this exact N-day duration.
 * @returns {{ priceUsd:number, anchorUsd:number|null, floorUsd:number, source:"competitor"|"floor" }}
 */
export function unlimitedPriceUsd({ days, competitorTotalsUsd = [], eaCostPerGbUsd }) {
  // competitorTotalsUsd = the competitors' 2GB/day TOTALS for exactly this N-day
  // duration (bytesim/roamic prices are non-linear in days, so pass the real
  // per-duration total). Undercut the cheapest by 10¢, never below the 2× floor.
  const valid = competitorTotalsUsd.filter((x) => x > 0);
  const anchorUsd = valid.length ? Math.min(...valid) - UNDERCUT_USD : null;
  const floorUsd = PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY * eaCostPerGbUsd * days;
  // with no competitor (or competitors below floor) → floor (max revenue @2× profit)
  const useAnchor = anchorUsd != null && anchorUsd >= floorUsd;
  return {
    priceUsd: useAnchor ? anchorUsd : floorUsd,
    anchorUsd,
    floorUsd,
    source: useAnchor ? "competitor" : "floor",
  };
}

/**
 * Viable to LIST as unlimited competitively for an N-day plan: the price ends up
 * on the competitor (we undercut AND clear 2× profit), not pinned to the floor.
 * Returns null without competitor data.
 */
export function isUnlimitedViable({ days, competitorTotalsUsd = [], eaCostPerGbUsd }) {
  if (!competitorTotalsUsd.some((x) => x > 0)) return null;
  return unlimitedPriceUsd({ days, competitorTotalsUsd, eaCostPerGbUsd }).source === "competitor";
}
