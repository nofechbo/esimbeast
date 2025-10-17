import { prisma } from "./prisma";

function normalizePlan(plan) {
    if (!plan) {
        throw new Error("normalizePlan called with null/undefined plan");
    } //do we really need this check?

  return {
    ...plan,
    price: Number(plan.price),
    data: Number(plan.data),
    salePrice: plan.salePrice ? Number(plan.salePrice) : null,
  };
}

export async function getAllPlans() {
   const plans =  await prisma.plan.findMany();

    return plans.map(normalizePlan)
}

export async function getPlanByuniqueName(uniqueName) {
    const plan = await prisma.plan.findUnique({
        where: { uniqueName }
    });

    if (!plan) return null;
    return normalizePlan(plan);
}

export async function findPlansByFilters({ countryCode, dataSize, duration }) {
    const plans = await prisma.plan.findMany({
        where: {
            countryCodes: { has: countryCode },
            days: { gte: duration },
            OR: [
              { data: { gte: dataSize } },
              { data: 0 } // include plans with unlimited data
            ]
        }
    });
  
    return plans.map(normalizePlan);
}