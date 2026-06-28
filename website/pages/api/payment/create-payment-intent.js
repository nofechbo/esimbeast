import { getPlanByuniqueName } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { evaluateCoupon, normalizeCode } from "@/lib/coupon";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const STRIPE_MIN_USD_CENTS = 50; // Stripe rejects USD charges under $0.50

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { uniqueName, qty, email, days, data, code, couponCode, ref } = req.body;
  if (!uniqueName || !email || !qty) {
    console.error(
      `Missing uniqueName, qty, or email, email: ${email}, uniqueName: ${uniqueName}, qty: ${qty}`
    );
    return res.status(400).json({ error: "Missing uniqueName, qty, or email" });
  }

  try {
    const purchasedPlan = await getPlanByuniqueName(uniqueName);
    if (!purchasedPlan) {
      console.error(`Plan not found: ${uniqueName}`);
      return res.status(400).json({ error: "Plan not found" });
    }

    const quantity = parseInt(qty, 10);
    const subtotal = purchasedPlan.price * quantity; // cents

    const metadata = { uniqueName, qty };
    if (days !== undefined) metadata.days = String(days);
    if (data !== undefined) metadata.data = String(data);
    if (code) metadata.code = code;
    // attribution — carried into the order at fulfillment
    if (ref) metadata.ref = String(ref).slice(0, 60);

    // Coupon: re-evaluate SERVER-SIDE. The client only sends the code string;
    // the discounted amount here is the authoritative charge.
    let amount = subtotal;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: normalizeCode(couponCode) } });
      const result = evaluateCoupon(coupon, subtotal);
      if (result.valid) {
        if (result.finalCents < STRIPE_MIN_USD_CENTS) {
          return res.status(400).json({
            error: `Total after the coupon is below the $0.50 minimum. Increase quantity or remove the coupon.`,
          });
        }
        amount = result.finalCents;
        metadata.couponCode = normalizeCode(couponCode);
        metadata.discountCents = String(result.discountCents);
      } else {
        // invalid/expired code: charge full price rather than fail the checkout
        console.warn(`Coupon "${couponCode}" not applied: ${result.reason}`);
      }
    }

    console.log(
      `PaymentIntent: ${uniqueName} ×${quantity}, subtotal ${subtotal}, charge ${amount}` +
        (metadata.couponCode ? ` (coupon ${metadata.couponCode} -${metadata.discountCents})` : "") +
        (metadata.ref ? ` ref=${metadata.ref}` : "")
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // cents, post-discount
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Failed to create a payment intent:", err);
    res.status(500).json({ error: "Failed to create a payment intent" });
  }
}
