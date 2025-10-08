import { prisma } from "./prisma";

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