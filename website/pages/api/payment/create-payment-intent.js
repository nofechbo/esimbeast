import { getPlanByuniqueName } from "@/lib/db/plans";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { uniqueName, qty, email, days, data } = req.body;
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

    const metadata = {
      uniqueName,
      qty,
    };

    // Include custom days and data in metadata if provided
    if (days !== undefined) {
      metadata.days = String(days);
    }
    if (data !== undefined) {
      metadata.data = String(data);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: purchasedPlan.price * qty, // price already in cents
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
