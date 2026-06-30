import { test } from "node:test";
import assert from "node:assert/strict";
import {
  unlimitedPriceUsd,
  isUnlimitedViable,
  initialLoadGb,
  floorFrom2GBDayUsd,
  floorFromTopupCostUsd,
} from "./price.js";

test("initial EA load by duration", () => {
  assert.equal(initialLoadGb(1), 3);
  assert.equal(initialLoadGb(3), 5);
  assert.equal(initialLoadGb(5), 5);
  assert.equal(initialLoadGb(7), 10);
  assert.equal(initialLoadGb(10), 20);
});

test("floor helpers", () => {
  assert.equal(floorFrom2GBDayUsd(1.6, 7).toFixed(2), "11.20"); // EA 2GB/Day $1.60 × 7
  assert.equal(floorFromTopupCostUsd(0.68, 7).toFixed(2), "19.04"); // 2×2.0×0.68×7
});

test("Thailand 7-day, EA 2GB/Day floor ($1.60/d) → undercut bytesim ($12.90)", () => {
  // floor = 1.60×7 = $11.20; bytesim 7d total $12.90 → anchor $12.80 ≥ floor → competitor
  const floorUsd = floorFrom2GBDayUsd(1.6, 7);
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [12.9], floorUsd });
  assert.equal(r.floorUsd.toFixed(2), "11.20");
  assert.equal(r.anchorUsd.toFixed(2), "12.80");
  assert.equal(r.source, "competitor");
  assert.equal(r.priceUsd.toFixed(2), "12.80");
});

test("floor binds when bytesim is below the EA 2GB/Day minimum price", () => {
  // EA 2GB/Day $2.00/d → floor 7d = $14.00; bytesim $11.90 (anchor $11.80 < floor) → floor
  const floorUsd = floorFrom2GBDayUsd(2.0, 7);
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [11.9], floorUsd });
  assert.equal(r.source, "floor");
  assert.equal(r.priceUsd.toFixed(2), "14.00");
});

test("no competitor price → floor", () => {
  const r = unlimitedPriceUsd({ days: 7, competitorTotalsUsd: [], floorUsd: 14 });
  assert.equal(r.source, "floor");
  assert.equal(r.priceUsd.toFixed(2), "14.00");
});

test("isUnlimitedViable: competitor wins → true; floor binds → false; no data → null", () => {
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [27.2], floorUsd: 14 }), true);
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [11.9], floorUsd: 14 }), false);
  assert.equal(isUnlimitedViable({ days: 7, competitorTotalsUsd: [], floorUsd: 14 }), null);
});
