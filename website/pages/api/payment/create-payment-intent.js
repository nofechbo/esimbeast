import { fetchAndParseCSV } from "@/lib/plans/fetchAndParseCSV";
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

    console.log(req.body)
    const { productId, slug, email } = req.body;
    if (!productId || !slug || !email) {
        return res.status(400).json({ error: 'Missing wmproductId, slug or email' });
    }

    try {
        const plans = await fetchAndParseCSV();

        const purchasedPlan = plans.find(p => p.productId === productId);
        if (!purchasedPlan) {
            return res.status(400).json({ error: "Plan not found" });
        }

        const metadata = {
            email,
            productList: [{
                wmproductId: productId,
                // qty,
                // planName,
                // data,
                // duration,
                // price,
            }],
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: purchasedPlan.price * 100, // stripe expects price in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata: {
                slug,
                planName: purchasedPlan.name,
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch(err) {
        console.error('Failed to create a payment intent:', err);
        res.status(500).json({ error: 'Failed to create a payment intent' });
    }
}