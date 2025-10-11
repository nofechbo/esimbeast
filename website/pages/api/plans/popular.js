import { getAllPlans } from "@/lib/db/plans";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const allPlans = await getAllPlans();
        const popularPlans = allPlans.filter(plan => plan.isPopular);

        res.status(200).json(popularPlans);
    } catch (error) {
        console.error("Error fetching popular plans:", error);
        res.status(500).json({ error: 'Failed to fetch popular plans' });
    }
}