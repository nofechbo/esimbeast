import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductName, priceCents, buildWmPlan } from "./build.js";

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

test("priceCents: TWD cost → USD cost + 2x retail", () => {
  // 1000 TWD × 0.031 = $31.00 cost; ×2 = $62.00 retail
  assert.deepEqual(priceCents(1000), { costCents: 3100, retailCents: 6200 });
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
  assert.equal(plan.price, 6200);
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
