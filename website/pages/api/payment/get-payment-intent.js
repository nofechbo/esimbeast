import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { payment_intent } = req.query;
    if (!payment_intent) {
        return res.status(400).json({ error: 'Missing payment_intent' });
    }

    try {
        const intent = await stripe.paymentIntents.retrieve(payment_intent);
        res.status(200).json(intent);
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'Unable to retrieve payment intent' });
    }
} 