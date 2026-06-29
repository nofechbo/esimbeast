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
  const r = unlimitedPriceUsd({ days: 7, competitorPerDayUsd: [3.9], eaCostPerGbUsd: 0.68 });
  assert.equal(r.anchorUsd.toFixed(2), "27.20"); // 3.90×7 − 0.10
  assert.equal(r.floorUsd.toFixed(2), "23.80"); // 5 × 0.68 × 7
  assert.equal(r.priceUsd.toFixed(2), "27.20");
  assert.equal(r.source, "competitor");
});

test("undercuts the CHEAPEST of bytesim/roamic", () => {
  // bytesim $3.90, roamic $3.50 → undercut roamic
  const r = unlimitedPriceUsd({ days: 1, competitorPerDayUsd: [3.9, 3.5], eaCostPerGbUsd: 0.5 });
  assert.equal(r.anchorUsd.toFixed(2), "3.40"); // 3.50 − 0.10
});

test("no competitor price → floor (max revenue at 2× profit)", () => {
  const r = unlimitedPriceUsd({ days: 7, competitorPerDayUsd: [], eaCostPerGbUsd: 0.68 });
  assert.equal(r.source, "floor");
  assert.equal(r.priceUsd.toFixed(2), "23.80");
});

test("expensive region: floor binds → price above competitor, not viable", () => {
  const r = unlimitedPriceUsd({ days: 7, competitorPerDayUsd: [3.9], eaCostPerGbUsd: 2.0 });
  assert.equal(r.source, "floor");
  assert.equal(isUnlimitedViable({ competitorPerDayUsd: [3.9], eaCostPerGbUsd: 2.0 }), false);
});

test("viability threshold is cheapestCompetitor/5; null without data", () => {
  assert.equal(isUnlimitedViable({ competitorPerDayUsd: [3.9], eaCostPerGbUsd: 0.78 }), true);
  assert.equal(isUnlimitedViable({ competitorPerDayUsd: [3.9], eaCostPerGbUsd: 0.79 }), false);
  assert.equal(isUnlimitedViable({ competitorPerDayUsd: [], eaCostPerGbUsd: 0.5 }), null);
});
