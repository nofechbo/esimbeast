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

// --- Clean-slug lookups (programmatic-SEO pages) ---

/** Resolve a variant page by its stored slug, e.g. "esim/france/10gb-30-days". */
export async function getPlanBySlug(slug) {
  const plan = await prisma.plan.findUnique({ where: { slug } });
  if (!plan) return null;
  return normalizePlan(plan);
}

/** The canonical (isPrimary) plans only — what we pre-render and put in the sitemap. */
export async function getPrimaryPlans() {
  const plans = await prisma.plan.findMany({ where: { isPrimary: true } });
  return plans.map(normalizePlan);
}

/** The canonical plan for a bucket — used to point non-primary variants at it. */
export async function getPrimaryByBucketKey(bucketKey) {
  if (!bucketKey) return null;
  const plan = await prisma.plan.findFirst({ where: { bucketKey, isPrimary: true } });
  if (!plan) return null;
  return normalizePlan(plan);
}

/** All plans whose slug sits under a country hub, e.g. "esim/france/". */
export async function getPlansByCountrySlug(countrySlugValue) {
  const plans = await prisma.plan.findMany({
    where: { slug: { startsWith: `esim/${countrySlugValue}/` }, isPrimary: true },
    orderBy: { price: "asc" },
  });
  return plans.map(normalizePlan);
}
