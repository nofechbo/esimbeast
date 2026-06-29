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
 * @param {{ days:number, bytesimPerDayUsd:number, eaCostPerGbUsd:number }} p
 * @returns {{ priceUsd:number, anchorUsd:number, floorUsd:number, anchorWins:boolean }}
 */
export function unlimitedPriceUsd({ days, competitorPerDayUsd = [], eaCostPerGbUsd }) {
  // undercut the CHEAPEST available competitor (bytesim and/or roamic) by 10¢
  const totals = competitorPerDayUsd.filter((x) => x > 0).map((x) => x * days);
  const anchorUsd = totals.length ? Math.min(...totals) - UNDERCUT_USD : null;
  const floorUsd = PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY * eaCostPerGbUsd * days;
  // never below floor; with no competitor (or competitors below floor) → floor
  // (max revenue that still clears 2× profit @2.5GB/day)
  const useAnchor = anchorUsd != null && anchorUsd >= floorUsd;
  return {
    priceUsd: useAnchor ? anchorUsd : floorUsd,
    anchorUsd,
    floorUsd,
    source: useAnchor ? "competitor" : "floor",
  };
}

/**
 * Viable to LIST as unlimited competitively (undercut a competitor AND clear 2×
 * profit) when EA is cheap enough: costPerGb ≤ cheapestCompetitorPerDay / 5.
 * Returns null when there's no competitor price to judge against.
 */
export function isUnlimitedViable({ competitorPerDayUsd = [], eaCostPerGbUsd }) {
  const cheapest = Math.min(...competitorPerDayUsd.filter((x) => x > 0));
  if (!Number.isFinite(cheapest)) return null;
  return eaCostPerGbUsd <= cheapest / (PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY);
}
