// import slugify from '@/utils/slugify';
// import { fetchPlans } from '@/utils/fetchPlans';

// export default async function handler(req, res) {
//     if (req.method !== 'GET') {
//         return res.status(405).end('Method Not Allowed');
//     }

//     const { region, slug } = req.query;

//     try {
//         const plans = await fetchPlans() || [];

//         const plan = plans.find(p => {
//             const regions = p.productRegion.split(',').map(r => r.trim().toLowerCase());
//             const slugified = slugify(p);
//             return regions.includes(region.toLowerCase()) && slugified === slug;
//         });
    
//         if (!plan) return res.status(404).json({ error: 'Not found' });
    
//         res.status(200).json(plan);

//     } catch (err) {
//         console.error("Error fetching plan:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }
