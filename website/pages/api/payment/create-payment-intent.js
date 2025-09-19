import { fetchAndParseCSV } from "@/lib/plans/fetchAndParseCSV";
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

    const { productId, email } = req.body;
    if (!productId || !email) {
        return res.status(400).json({ error: 'Missing productId or email' });
    }

    try {
        const plans = await fetchAndParseCSV();

        const purchasedPlan = plans.find(p => p.productId === productId);
        if (!purchasedPlan) {
            return res.status(400).json({ error: "Plan not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: purchasedPlan.price * 100, // stripe expects price in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata: {
                productId: productId, //purchasedPlan.productId
                qty: 1, //current plug
                planName: purchasedPlan.name,
                countryCodes: purchasedPlan.countryCodes,
                data: purchasedPlan.dataCap,
                duration: purchasedPlan.validity,
                price: purchasedPlan.price //do we need it? we have amount...
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch(err) {
        console.error('Failed to create a payment intent:', err);
        res.status(500).json({ error: 'Failed to create a payment intent' });
    }
}