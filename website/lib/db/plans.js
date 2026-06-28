import { prisma } from "./prisma";

function normalizePlan(plan) {
  return {
    ...plan,
    data: Number(plan.data), // convert Decimal to Number for JSON serialization
  };
}

export async function getAllPlans() {
  // capped (total-data) plans first, then cheapest — daily-limit plans sink to
  // the bottom of every listing (they're the deprioritized, non-refill kind).
  const plans = await prisma.plan.findMany({
    orderBy: [{ isCapped: "desc" }, { price: "asc" }],
  });

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
    // capped-first, then cheapest: the chooser surfaces a daily-limit plan only
    // when no capped plan fits the request.
    orderBy: [{ isCapped: "desc" }, { price: "asc" }],
  });

  return plans.map(normalizePlan);
}

export async function getPopularPlans() {
  const plans = await prisma.plan.findMany({
    where: { isPopular: true },
  });

  return plans.map(normalizePlan);
}
