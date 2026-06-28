// An EA plan is "eSIMdb-eligible" — gets the (competitor−1¢)×2 price-war pricing
// AND is the only thing the 50% ESIMDB coupon applies to — when it's a 10GB or
// 20GB plan of 30 days or less. Everything else keeps regular pricing and the
// coupon is rejected on it (so the 50% can't gut the rest of the catalog).

export const ESIMDB_SIZES_GB = [10, 20];
export const ESIMDB_MAX_DAYS = 30;

export function isEsimdbProduct(plan) {
  if (!plan || plan.supplier !== "EA") return false;
  const gb = Math.round(Number(plan.data));
  return ESIMDB_SIZES_GB.includes(gb) && Number(plan.days) <= ESIMDB_MAX_DAYS;
}
