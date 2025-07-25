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

    const { productId, slug } = req.body;
    if (!productId || !slug) {
        return res.status(400).json({ error: 'Missing productId or slug' });
    }

    try {
        const plans = await fetchPlans();

        const purchasedPlan = plans.find(p => p.productId === productId);
        if (!purchasedPlan) {
            return res.status(400).json({ error: "Plan not found" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name:purchasedPlan.productName,
                        },
                        unit_amount: purchasedPlan.productcPrice * 100, //cents
                    },
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/${slug}`,
        })

        res.status(200).json({ url: session.url });

    } catch (err) {
        console.error('Failed to create a checkout session:', err);
        res.status(500).json({ error: 'Failed to create a checkout session' });
    }
}
