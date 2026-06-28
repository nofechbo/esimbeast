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

test("USA 7-day: anchor (undercut bytesim) wins, 2× profit clears", () => {
  // bytesim $3.90/day, EA cost/GB $0.68
  const r = unlimitedPriceUsd({ days: 7, bytesimPerDayUsd: 3.9, eaCostPerGbUsd: 0.68 });
  assert.equal(r.anchorUsd.toFixed(2), "27.20"); // 3.90×7 − 0.10
  assert.equal(r.floorUsd.toFixed(2), "23.80"); // 5 × 0.68 × 7
  assert.equal(r.priceUsd.toFixed(2), "27.20");
  assert.equal(r.anchorWins, true);
});

test("expensive region: floor binds → price above bytesim, not viable", () => {
  const r = unlimitedPriceUsd({ days: 7, bytesimPerDayUsd: 3.9, eaCostPerGbUsd: 2.0 });
  assert.equal(r.floorUsd > r.anchorUsd, true);
  assert.equal(r.priceUsd, r.floorUsd);
  assert.equal(isUnlimitedViable({ bytesimPerDayUsd: 3.9, eaCostPerGbUsd: 2.0 }), false);
});

test("viability threshold is bytesim/5", () => {
  assert.equal(isUnlimitedViable({ bytesimPerDayUsd: 3.9, eaCostPerGbUsd: 0.78 }), true);
  assert.equal(isUnlimitedViable({ bytesimPerDayUsd: 3.9, eaCostPerGbUsd: 0.79 }), false);
});
