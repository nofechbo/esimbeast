// Parse esimdb.com country-page HTML into structured plans. esimdb inlines its
// state as a Nuxt "devalue" array: a flat array where objects reference other
// entries by numeric index. We resolve those refs to recover each plan
// (capacity MB, period days, USD price + promo). Server-rendered, so a plain
// fetch works — but this depends on esimdb's internal state shape, so it's
// inherently fragile; validate output before trusting it.

/** @returns {Array<{name,capacityMb,days,usdPrice,usdPromoPrice,effectiveUsd,hasPhone}>} */
export function parseEsimdbPlans(html) {
  const m = html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return [];
  let arr;
  try {
    arr = JSON.parse(m[1]);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const get = (i) => (typeof i === "number" && i >= 0 && i < arr.length ? arr[i] : i);
  const num = (v) => (typeof get(v) === "number" ? get(v) : null);

  const plans = [];
  for (const node of arr) {
    if (!node || typeof node !== "object" || Array.isArray(node)) continue;
    if (!("capacity" in node && "period" in node && "prices" in node)) continue;
    const capacityMb = num(node.capacity);
    const days = num(node.period);
    if (capacityMb == null || days == null) continue;

    const prices = get(node.prices);
    const promo = get(node.promoPrices);
    const usdPrice = num(node.usdPrice) ?? (prices ? num(prices.USD) : null);
    const usdPromoPrice = num(node.usdPromoPrice) ?? (promo ? num(promo.USD) : null);
    plans.push({
      name: typeof get(node.name) === "string" ? get(node.name) : null,
      capacityMb,
      days,
      usdPrice,
      usdPromoPrice,
      effectiveUsd: usdPromoPrice ?? usdPrice, // the price a buyer actually pays
      hasPhone: get(node.phone_number) === true,
    });
  }
  return plans;
}

/** Cheapest effective USD price (cents) for a given GB size at ≤ maxDays. */
export function cheapestUsdCents(plans, gb, maxDays) {
  const matching = plans.filter(
    (p) => Math.round(p.capacityMb / 1000) === gb && p.days <= maxDays && p.effectiveUsd > 0,
  );
  if (!matching.length) return null;
  const best = matching.reduce((a, b) => (b.effectiveUsd < a.effectiveUsd ? b : a));
  return { priceCents: Math.round(best.effectiveUsd * 100), days: best.days, name: best.name };
}
