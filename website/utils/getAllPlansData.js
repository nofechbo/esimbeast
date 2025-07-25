import slugify from './slugify.js';
import { fetchPlans } from './fetchPlans.js';

export default async function getAllPlansData() {
    const plans = await fetchPlans();

    return plans.map(plan => ({
        planName: plan.productName,
         // planRegions: plan.productRegion.split(",").map(r => r.trim().toLowerCase()),
        slug: slugify(plan),
    }));
}