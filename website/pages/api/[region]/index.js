import { fetchPlans } from '@/utils/fetchPlans';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }
  
  const { region } = req.query;

  try {
    const plans = await fetchPlans() || [];

    if (!region || region.toLowerCase() === 'all') {
      return res.status(200).json(plans);
    }

    const filtered = plans.filter(p => {
      const planRegions = p.productRegion.split(",").map(r => r.trim().toLowerCase());
      return planRegions.includes(region.toLowerCase());
    });
  
    res.status(200).json(filtered);

  } catch (err) {
    console.error('Failed to fetch plans:', err);
    res.status(500).json({ error: 'Failed to load plans' });
  }
}

