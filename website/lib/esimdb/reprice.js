// eSIMdb price-war repricer (EA channel).
//
// Customers from eSIMdb pay (list × 0.5) after the 50% ESIMDB coupon. We want
// that NET to be 1¢ under the cheapest competitor on esimdb.com — but never below
// our cost + a minimum margin. So:
//
//   net  = max(competitor − 1¢, cost + minMargin)   // floored: never sell at a loss
//   list = net × 2                                   // 50% coupon brings it back to net
//
// list becomes Plan.price for the EA plan. Non-coupon buyers pay the list; eSIMdb
// buyers (with the code) pay net.

export const ESIMDB_MIN_MARGIN_PCT = Number(process.env.ESIMDB_MIN_MARGIN_PCT || 0.15); // 15% over cost
export const ESIMDB_COUPON_PCT = 50; // the ESIMDB coupon discount

/**
 * @param {number} competitorCents  cheapest esimdb.com price for this plan
 * @param {number} costCents        our cost (EA supplierPrice, in cents)
 * @param {{ minMarginPct?:number }} [opts]
 * @returns {{ netCents:number, listCents:number, floored:boolean }}
 */
export function esimdbListPriceCents(competitorCents, costCents, opts = {}) {
  const minMarginPct = opts.minMarginPct ?? ESIMDB_MIN_MARGIN_PCT;
  const floorNet = Math.round(costCents * (1 + minMarginPct)); // cost + min margin
  const undercut = competitorCents - 1; // a 1¢ undercut
  const netCents = Math.max(undercut, floorNet);
  return {
    netCents,
    listCents: netCents * 2, // ÷2 by the 50% coupon → netCents
    floored: undercut < floorNet, // true = competitor was below our floor; we held the floor
  };
}
