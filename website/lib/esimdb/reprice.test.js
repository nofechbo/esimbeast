import { test } from "node:test";
import assert from "node:assert/strict";
import { esimdbListPriceCents } from "./reprice.js";

test("undercuts competitor by 1¢ when above the floor; list = net × 2", () => {
  // competitor $5.00, cost $1.50, 15% margin floor = 173¢ → net 499, list 998
  const r = esimdbListPriceCents(500, 150, { minMarginPct: 0.15 });
  assert.equal(r.netCents, 499);
  assert.equal(r.listCents, 998);
  assert.equal(r.floored, false);
});

test("holds the cost+margin floor when the competitor is cheaper than us", () => {
  // competitor $1.50, cost $1.50 → undercut 149 < floor 173 → net 173, list 346
  const r = esimdbListPriceCents(150, 150, { minMarginPct: 0.15 });
  assert.equal(r.netCents, 173);
  assert.equal(r.listCents, 346);
  assert.equal(r.floored, true);
});

test("the 50% coupon on the list price returns exactly the net (undercut)", () => {
  const { netCents, listCents } = esimdbListPriceCents(800, 200);
  assert.equal(Math.round(listCents * 0.5), netCents);
});
