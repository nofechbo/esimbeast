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
export function unlimitedPriceUsd({ days, bytesimPerDayUsd, eaCostPerGbUsd }) {
  const anchorUsd = bytesimPerDayUsd * days - UNDERCUT_USD;
  const floorUsd = PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY * eaCostPerGbUsd * days;
  const anchorWins = anchorUsd >= floorUsd;
  return { priceUsd: Math.max(anchorUsd, floorUsd), anchorUsd, floorUsd, anchorWins };
}

/**
 * Viable to LIST as unlimited (undercut bytesim AND clear 2× profit) when EA is
 * cheap enough: costPerGb ≤ bytesimPerDay / 5 (duration-independent).
 */
export function isUnlimitedViable({ bytesimPerDayUsd, eaCostPerGbUsd }) {
  return eaCostPerGbUsd <= bytesimPerDayUsd / (PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY);
}
