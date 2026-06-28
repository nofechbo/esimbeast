import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCoupon, normalizeCode, COUPON_TYPE } from "./coupon.js";

const percent = (v, over = {}) => ({ code: "X", type: COUPON_TYPE.PERCENT, value: v, active: true, redemptions: 0, ...over });
const fixed = (v, over = {}) => ({ code: "X", type: COUPON_TYPE.FIXED, value: v, active: true, redemptions: 0, ...over });

test("normalizeCode upper/trim", () => {
  assert.equal(normalizeCode("  esimDB10 "), "ESIMDB10");
});

test("percent discount", () => {
  const r = evaluateCoupon(percent(10), 2000);
  assert.deepEqual(r, { valid: true, discountCents: 200, finalCents: 1800 });
});

test("fixed discount", () => {
  assert.deepEqual(evaluateCoupon(fixed(500), 2000), { valid: true, discountCents: 500, finalCents: 1500 });
});

test("fixed larger than subtotal is capped (never negative)", () => {
  assert.deepEqual(evaluateCoupon(fixed(5000), 2000), { valid: true, discountCents: 2000, finalCents: 0 });
});

test("invalid / inactive / expired / limit / min-amount all reject", () => {
  assert.equal(evaluateCoupon(null, 2000).valid, false);
  assert.equal(evaluateCoupon(percent(10, { active: false }), 2000).valid, false);
  assert.equal(evaluateCoupon(percent(10, { expiresAt: new Date(Date.now() - 1000) }), 2000).valid, false);
  assert.equal(evaluateCoupon(percent(10, { maxRedemptions: 5, redemptions: 5 }), 2000).valid, false);
  assert.equal(evaluateCoupon(percent(10, { minAmountCents: 3000 }), 2000).valid, false);
});

test("supplierScope restricts the code to one supplier's plans", () => {
  const eaOnly = percent(50, { supplierScope: "EA" });
  assert.equal(evaluateCoupon(eaOnly, 2000, { supplier: "EA" }).valid, true);
  assert.equal(evaluateCoupon(eaOnly, 2000, { supplier: "WM" }).valid, false);
  // unscoped coupon works on any supplier
  assert.equal(evaluateCoupon(percent(50), 2000, { supplier: "WM" }).valid, true);
});

test("misconfigured percent (>100) rejected, not a free order", () => {
  const r = evaluateCoupon(percent(150), 2000);
  assert.equal(r.valid, false);
  assert.equal(r.finalCents, 2000);
});
