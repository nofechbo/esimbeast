import { getAllPlans } from "@/lib/db/plans";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }
  
  try {
    const plans = await getAllPlans();
    res.status(200).json(plans);
  } catch (error) {
    console.error("API handler error fetching plans:", error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }

}