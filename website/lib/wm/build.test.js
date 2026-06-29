import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductName, priceCents, buildWmPlan, wmMarkup } from "./build.js";

test("wmMarkup: flat 2× normally; tiered for high-margin (multi-country / calling)", () => {
  assert.equal(wmMarkup(500, false), 2); // normal plan
  assert.equal(wmMarkup(500, true), 2.2); // < $10
  assert.equal(wmMarkup(1500, true), 1.7); // $10–$20
  assert.equal(wmMarkup(2500, true), 1.35); // > $20
});

test("parseProductName: daily plan with FUP speed", () => {
  const r = parseProductName("Multi-region A, 10 Days, 1GB /day, 128kbps");
  assert.deepEqual(r, { days: 10, dataGb: 1, isDaily: true, isUnlimited: false, reducedKbps: 128 });
});

test("parseProductName: total-data plan (no /day)", () => {
  const r = parseProductName("Taiwan, 30 Days, 1GB, 128kbps");
  assert.equal(r.days, 30);
  assert.equal(r.isDaily, false);
  assert.equal(r.dataGb, 1);
});

test("parseProductName: unlimited + MB conversion", () => {
  assert.equal(parseProductName("X, 10 Days, Unlimited data /day").dataGb, 0);
  assert.equal(parseProductName("X, 10 Days, 500MB /day").dataGb, 0.5);
});

test("priceCents: TWD → USD (0.0314) × 2 markup", () => {
  // 1000 TWD × 0.0314 = $31.40 base; × 2 = $62.80 retail
  assert.deepEqual(priceCents(1000), { costCents: 3140, retailCents: 6280 });
});

const fam = {
  name: "Multi-region A",
  countryCodes: ["AU", "MO", "PK"],
  isMulti: true,
  byCountry: [{ country: "Australia", countryCode: "AU", operators: ["Telstra", "Optus"] }],
  network: "4G", apn: "plus", roaming: "CSL", notes: "", reset: "00:00", hasPhone: true,
};

test("buildWmPlan: matched family -> coverage + capped(daily=false) + hasPhone", () => {
  const p = { wmproductId: "WM-e-A-1GB-10D", productId: "LeSIM-1", productName: "Multi-region A, 10 Days, 1GB /day, 128kbps", productPrice: 1000 };
  const plan = buildWmPlan(p, { family: fam });
  assert.deepEqual(plan.countryCodes, ["AU", "MO", "PK"]);
  assert.equal(plan.isCapped, false); // daily plan
  assert.equal(plan.hasPhone, true);
  assert.equal(plan.supplier, "WM");
  assert.equal(plan.reloadable, false);
  // multi-country (3) + hasPhone → high-margin tiered markup. cost = 1000×0.0314
  // = $31.40 (>$20) → 1.35× → round(3140 × 1.35) = 4239
  assert.equal(plan.price, 4239);
  assert.ok(plan.coverage && plan.coverage.byCountry[0].operators.includes("Telstra"));
});

test("buildWmPlan: no family -> prefix-country fallback, null coverage", () => {
  const p = { wmproductId: "WM-SG-1", productId: "LeSIM-2", productName: "Singapore, 10 Days, 1GB /day", productPrice: 200 };
  const plan = buildWmPlan(p, null);
  assert.deepEqual(plan.countryCodes, ["SG"]);
  assert.equal(plan.coverage, null);
});

test("buildWmPlan: unbuildable (no country, no family) -> null", () => {
  const p = { wmproductId: "x", productName: "Global, 10 Days, 1GB /day", productPrice: 500 };
  assert.equal(buildWmPlan(p, null), null);
});
