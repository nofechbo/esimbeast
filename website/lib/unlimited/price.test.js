import { test } from "node:test";
import assert from "node:assert/strict";
import { unlimitedPriceUsd, isUnlimitedViable, initialLoadGb } from "./price.js";

test("initial EA load by duration", () => {
  assert.equal(initialLoadGb(1), 3);
  assert.equal(initialLoadGb(3), 5);
  assert.equal(initialLoadGb(5), 5);
  assert.equal(initialLoadGb(7), 10);
  assert.equal(initialLoadGb(10), 20);
});

test("USA 7-day: undercut bytesim's actual 7d total ($11.90), 2× profit clears", () => {
  // bytesim 7d 2GB/day total = $11.90, EA cost/GB $0.68
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [11.9], eaCostPerGbUsd: 0.68 });
  assert.equal(r.anchorUsd.toFixed(2), "11.80"); // 11.90 − 0.10
  assert.equal(r.floorUsd.toFixed(2), "19.04"); // 4 × 0.68 × 7 (2.0GB/day fair-use)
  // floor ($19.04) > anchor ($11.80) → bytesim is below our 2× floor here → floor wins
  assert.equal(r.source, "floor");
  assert.equal(r.priceUsd.toFixed(2), "19.04");
});

test("undercuts the CHEAPEST of bytesim/roamic totals", () => {
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [27.2, 25.0], eaCostPerGbUsd: 0.68 });
  assert.equal(r.anchorUsd.toFixed(2), "24.90"); // 25.00 − 0.10
  assert.equal(r.source, "competitor"); // 24.90 ≥ floor 19.04
});

test("no competitor price → floor (max revenue at 2× profit)", () => {
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [], eaCostPerGbUsd: 0.68 });
  assert.equal(r.source, "floor");
  assert.equal(r.priceUsd.toFixed(2), "19.04"); // 4 × 0.68 × 7
});

test("isUnlimitedViable: competitor wins → true; floor binds → false; no data → null", () => {
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [27.2], eaCostPerGbUsd: 0.68 }), true);
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [11.9], eaCostPerGbUsd: 0.68 }), false);
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [], eaCostPerGbUsd: 0.68 }), null);
});
