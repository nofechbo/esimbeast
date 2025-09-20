import { getPlanByuniqueName } from "@/lib/db/plans";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { uniqueName } = req.query;
    if (!uniqueName) {
        return res.status(400).json({ error: 'Missing uniqueName' });
    }

    try {
        const plan = await getPlanByuniqueName(uniqueName);
        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }
        res.status(200).json(plan);
    } catch (error) {
        console.error("API handler error fetching plan by uniqueName:", error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
}