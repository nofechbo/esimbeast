import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEsimdbPlans, cheapestUsdCents } from "./scrape.js";

// minimal Nuxt-devalue array: a plan object whose fields are indices into the array
const arr = [
  { capacity: 1, period: 2, prices: 3, usdPrice: 4, usdPromoPrice: 5, phone_number: 6, name: 7 },
  10000, // 1 capacity (MB)
  30, // 2 period (days)
  { USD: 8 }, // 3 prices
  12, // 4 usdPrice
  10, // 5 usdPromoPrice (promo → effective)
  false, // 6 phone_number
  "USA 10GB", // 7 name
  12, // 8 prices.USD
];
const html = `<x><script type="application/json">${JSON.stringify(arr)}</script></x>`;

test("parseEsimdbPlans resolves devalue refs, uses promo as effective", () => {
  const plans = parseEsimdbPlans(html);
  assert.equal(plans.length, 1);
  assert.deepEqual(plans[0], {
    name: "USA 10GB", capacityMb: 10000, days: 30,
    usdPrice: 12, usdPromoPrice: 10, effectiveUsd: 10, hasPhone: false,
  });
});

test("cheapestUsdCents picks the lowest effective price for the GB/maxDays bucket", () => {
  const plans = [
    { capacityMb: 10000, days: 30, effectiveUsd: 14 },
    { capacityMb: 10000, days: 7, effectiveUsd: 10.8 },
    { capacityMb: 10000, days: 60, effectiveUsd: 5 }, // over maxDays → excluded
    { capacityMb: 20000, days: 30, effectiveUsd: 22.99 },
  ];
  assert.equal(cheapestUsdCents(plans, 10, 30).priceCents, 1080);
  assert.equal(cheapestUsdCents(plans, 20, 30).priceCents, 2299);
  assert.equal(cheapestUsdCents(plans, 5, 30), null);
});

test("parseEsimdbPlans returns [] on missing/garbage state", () => {
  assert.deepEqual(parseEsimdbPlans("<html>no script</html>"), []);
});
