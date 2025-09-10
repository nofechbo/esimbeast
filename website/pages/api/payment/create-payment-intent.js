import { fetchPlans } from "@/utils/fetchPlans";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { wmproductId, slug, email } = req.body;
    if (!wmproductId || !slug || !email) {
        return res.status(400).json({ error: 'Missing wmproductId, slug or email' });
    }

    try {
        const plans = await fetchPlans();

        const purchasedPlan = plans.find(p => p.wmproductId === wmproductId);
        if (!purchasedPlan) {
            return res.status(400).json({ error: "Plan not found" });
        }

        const metadata = {
            email,
            productList: [{
                wmproductId,
                qty,
                productN,
                planName,
                data,
                duration,
                price,
            }],
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: purchasedPlan.productcPrice * 100, // stripe expects price in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata: {
                slug,
                planName: purchasedPlan.planName,
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch(err) {
        console.error('Failed to create a payment intent:', err);
        res.status(500).json({ error: 'Failed to create a payment intent' });
    }
}