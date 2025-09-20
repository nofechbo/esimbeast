import { getAllPlans, getPlanByuniqueName } from "@/lib/db/plans";
import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2024-04-10',
// });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { uniqueName, qty, email } = req.body;
    if (!uniqueName || !email || !qty) {
        return res.status(400).json({ error: 'Missing uniqueName, qty, or email' });
    }

    try {
        const purchasedPlan = await getPlanByuniqueName(uniqueName);
        if (!purchasedPlan) {
            return res.status(400).json({ error: "Plan not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: purchasedPlan.price * 100 * qty, // stripe expects price in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata: {
                uniqueName,
                qty,
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch(err) {
        console.error('Failed to create a payment intent:', err);
        res.status(500).json({ error: 'Failed to create a payment intent' });
    }
}