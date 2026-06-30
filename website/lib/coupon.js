// Pure coupon evaluation — no I/O, so it's unit-testable and shared by the
// validate API and create-payment-intent (which is the ONLY place the discounted
// amount is authoritative; the client never decides the price).

import { isEsimdbProduct } from "./esimdb/eligible.js";

export const COUPON_TYPE = { PERCENT: "percent", FIXED: "fixed" };

/** Canonical form for storage + lookup (case-insensitive, trimmed). */
export function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

/**
 * Evaluate a coupon against an order subtotal.
 * @param {object|null} coupon  a Coupon row (or null if the code didn't match)
 * @param {number} subtotalCents  price × qty, in cents
 * @param {{ now?:Date, supplier?:string }} [opts]  supplier = the plan's supplier,
 *   checked against coupon.supplierScope (the eSIMdb 50% code is scoped to "EA").
 * @returns {{ valid:boolean, reason?:string, discountCents:number, finalCents:number }}
 */
export function evaluateCoupon(coupon, subtotalCents, opts = {}) {
  const now = opts.now ?? new Date();
  const supplier = opts.supplier ?? opts.plan?.supplier;
  const fail = (reason) => ({ valid: false, reason, discountCents: 0, finalCents: subtotalCents });

  if (!coupon) return fail("Invalid coupon code");
  if (!coupon.active) return fail("This coupon is no longer active");
  // supplier scope — keeps a high-percent code off the rest of the catalog
  if (coupon.supplierScope && supplier && coupon.supplierScope !== supplier) {
    return fail("This code isn't valid for this product");
  }
  // product scope — the eSIMdb 50% code only applies to EA 10/20GB ≤30d plans
  if (coupon.productScope === "esimdb" && !isEsimdbProduct(opts.plan)) {
    return fail("This code is only valid on 10GB and 20GB plans");
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return fail("This coupon has expired");
  if (coupon.maxRedemptions != null && coupon.redemptions >= coupon.maxRedemptions) {
    return fail("This coupon has reached its redemption limit");
  }
  if (coupon.minAmountCents != null && subtotalCents < coupon.minAmountCents) {
    return fail(`Order must be at least $${(coupon.minAmountCents / 100).toFixed(2)} to use this coupon`);
  }

  let discount;
  if (coupon.type === COUPON_TYPE.PERCENT) {
    if (!(coupon.value > 0 && coupon.value <= 100)) return fail("Misconfigured coupon");
    discount = Math.round((subtotalCents * coupon.value) / 100);
  } else if (coupon.type === COUPON_TYPE.FIXED) {
    discount = coupon.value;
  } else {
    return fail("Misconfigured coupon");
  }

  // never discount below zero, never go negative
  discount = Math.max(0, Math.min(discount, subtotalCents));
  return { valid: true, discountCents: discount, finalCents: subtotalCents - discount };
}
