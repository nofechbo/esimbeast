import { prisma } from "./prisma";

function normalizePlan(plan) {
  return {
    ...plan,
    data: Number(plan.data), // convert Decimal to Number for JSON serialization
  };
}

export async function getAllPlans() {
  const plans = await prisma.plan.findMany();

  return plans.map(normalizePlan);
}

export async function getSearchOptionsData() {
  const plans = await prisma.plan.findMany({
    select: {
      data: true,
      days: true,
      countryCodes: true,
    },
  });

  return plans;
}

export async function getPlanByuniqueName(uniqueName) {
  const plan = await prisma.plan.findUnique({
    where: { uniqueName },
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
        { data: 0 }, // include plans with unlimited data
      ],
    },
  });

  return plans.map(normalizePlan);
}

export async function getPopularPlans() {
  const plans = await prisma.plan.findMany({
    where: { isPopular: true },
  });

  return plans.map(normalizePlan);
}
