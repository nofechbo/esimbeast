import { getPlanByuniqueName } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { evaluateCoupon, normalizeCode } from "@/lib/coupon";

/**
 * Preview a coupon for the checkout UI: returns the discount and final amount for
 * a given plan + qty. This is advisory only — create-payment-intent re-validates
 * and sets the authoritative amount, so the UI can never dictate the price.
 *
 * POST { code, uniqueName, qty } -> { valid, discountCents, finalCents, label } | { valid:false, reason }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const { code, uniqueName, qty } = req.body || {};
  const n = parseInt(qty, 10);
  if (!code || !uniqueName || !Number.isInteger(n) || n <= 0) {
    return res.status(400).json({ valid: false, reason: "Missing code, plan, or quantity" });
  }

  try {
    const plan = await getPlanByuniqueName(uniqueName);
    if (!plan) return res.status(400).json({ valid: false, reason: "Plan not found" });

    const subtotal = plan.price * n;
    const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCode(code) } });
    const result = evaluateCoupon(coupon, subtotal);

    if (!result.valid) return res.status(200).json({ valid: false, reason: result.reason });
    return res.status(200).json({
      valid: true,
      code: normalizeCode(code),
      discountCents: result.discountCents,
      finalCents: result.finalCents,
      label: coupon.type === "percent" ? `${coupon.value}% off` : `$${(coupon.value / 100).toFixed(2)} off`,
    });
  } catch (err) {
    console.error("coupon validate error:", err);
    return res.status(500).json({ valid: false, reason: "Could not validate coupon" });
  }
}
