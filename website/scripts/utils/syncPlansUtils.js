import { prisma } from "../../lib/db/prisma.js";
import { supplierToDBFuncMap } from "./mapping.js";
import { buildBucketKey, buildSlug } from "../../lib/slug.js";
import slugify from "../../utils/formaters.js";
import dotenv from "dotenv";
dotenv.config();

export const MIN_PLANS_THRESHOLD = 20;

export const suppliers = {
  wm: {
    name: "WM",
    sheetId: process.env.DB_SHEET_ID,
    sheetTabGid: process.env.DB_SHEET_WM_TAB_GID,
  },
  EA: {
    name: "EA",
    sheetId: process.env.DB_SHEET_ID,
    sheetTabGid: process.env.DB_SHEET_EA_TAB_GID,
  },
};

export function transformCsvDataToPlan(csvRow, supplierName) {
  const funcs = supplierToDBFuncMap[supplierName];
  if (!funcs) {
    throw new Error(`unknown supplier: ${supplierName}`);
  }

  try {
    return {
      productId: funcs.productId(csvRow),
      code: funcs.code(csvRow),
      name: funcs.name(csvRow),
      days: funcs.days(csvRow),
      limited: funcs.limited(csvRow),
      fup: funcs.fup(csvRow),
      data: funcs.data(csvRow),
      dailyDataCap: funcs.dailyDataCap(csvRow),
      reducedSpeed: funcs.reducedSpeed(csvRow),
      price: funcs.price(csvRow),
      supplierPrice: funcs.supplierPrice(csvRow),
      reloadable: funcs.reloadable(csvRow),
      countryCodes: funcs.countryCodes(csvRow),
      networks: funcs.networks(csvRow),
      networkSpeed: funcs.networkSpeed(csvRow),
      apn: funcs.apn(csvRow),
      hotspot: funcs.hotspot(csvRow),
      activation: funcs.activation(csvRow),
      delivery: funcs.delivery(csvRow),
      seoText: funcs.seoText(csvRow),
      planType: funcs.planType(csvRow),
      localNumber: funcs.localNumber(csvRow),
      notification: funcs.notification(csvRow),
      eKYC: funcs.eKYC(csvRow),
      uniqueName: funcs.uniqueName(csvRow),
      isPopular: funcs.isPopular(csvRow),
      supplier: funcs.supplier(csvRow),
    };
  } catch (error) {
    console.warn(
      `[${supplierName}] Skipping row (productId: ${csvRow["wmproductId"] ?? csvRow.packageCode ?? "unknown"}): ${error.message}`,
    );
    return;
  }
}

export async function upsertAndDelete(
  supplier,
  transformedPlans,
  totalFromCsv,
) {
  if (transformedPlans.length === 0) {
    console.warn(`[${supplier}] No valid plans to sync — aborting to avoid deleting existing plans.`);
    return { success: false, totalFromCsv, upserted: 0, deleted: 0 };
  }

  const csvUniqueNames = new Set(transformedPlans.map((p) => p.uniqueName));

  const existingPlans = await prisma.plan.findMany({ where: { supplier } });
  const existingUniqueNames = new Set(existingPlans.map((p) => p.uniqueName));

  console.log(`Upserting ${supplier} plans...`);
  let upserted = 0;

  for (const planData of transformedPlans) {
    try {
      // bucketKey groups SKUs onto one canonical page. The clean `slug` is NOT
      // set here — reconcileSlugsAndPrimaries() assigns it to the bucket's
      // primary after the sync, so it stays unique and bucket-stable.
      const withBucket = { ...planData, bucketKey: buildBucketKey(planData) };
      await prisma.plan.upsert({
        where: { supplier_productId: { supplier: planData.supplier, productId: planData.productId } },
        update: withBucket,
        create: withBucket,
      });
      upserted++;
      if (upserted % 10 === 0) {
        console.log(`Upserted ${upserted}/${transformedPlans.length} plans`);
      }
    } catch (error) {
      console.error(
        `❌ Error upserting plan ${planData.uniqueName}:`,
        error.message,
      );
    }
  }
  console.log(`Upserted ${upserted} ${supplier} plans total`);

  const plansToDelete = [...existingUniqueNames].filter(
    (name) => !csvUniqueNames.has(name),
  );
  let deleted = 0;

  if (plansToDelete.length > 0) {
    console.log(
      `Deleting ${plansToDelete.length} removed ${supplier} plans...`,
    );
    try {
      const deleteResult = await prisma.plan.deleteMany({
        where: { supplier, uniqueName: { in: plansToDelete } },
      });
      deleted = deleteResult.count;
      console.log(`Deleted ${deleted} plans`);
    } catch (error) {
      console.error(`❌ Error deleting ${supplier} plans:`, error.message);
    }
  }

  console.log(
    `${supplier} sync completed! Upserted: ${upserted}, Deleted: ${deleted}`,
  );
  return { success: true, totalFromCsv, upserted, deleted };
}

export async function getPlanStats() {
  const total = await prisma.plan.count();
  const countries = await prisma.plan.findMany({
    select: { countryCodes: true },
    distinct: ["countryCodes"],
  });

  const uniqueCountries = new Set();
  countries.forEach((plan) => {
    plan.countryCodes.forEach((code) => uniqueCountries.add(code));
  });

  return {
    totalPlans: total,
    uniqueCountries: uniqueCountries.size,
  };
}

/**
 * Assign one canonical page per bucket and keep the redirect map fresh.
 * Run after every sync (and from scripts/backfillSlugs.js):
 *   - group all plans by bucketKey
 *   - pick the cheapest as isPrimary; it gets the clean, bucket-stable `slug`
 *   - non-primary SKUs get slug = null (shown as alternatives on the primary page)
 *   - every plan's old /plans/<uniqueName> URL 301s to its bucket's canonical
 *
 * The slug VALUE is derived from (country, data, duration) — the bucket itself —
 * so it stays stable even when the primary SKU changes underneath it.
 */
export async function reconcileSlugsAndPrimaries() {
  const plans = await prisma.plan.findMany();
  const buckets = new Map();
  for (const p of plans) {
    const key = p.bucketKey || buildBucketKey(p);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(p);
  }

  let primaries = 0;
  let redirects = 0;
  for (const [key, arr] of buckets) {
    arr.sort((a, b) => a.price - b.price || a.id - b.id);
    const primary = arr[0];
    const slug = buildSlug(primary);

    await prisma.plan.update({
      where: { id: primary.id },
      data: { isPrimary: true, slug, bucketKey: key },
    });
    primaries++;

    for (const p of arr.slice(1)) {
      if (p.isPrimary || p.slug) {
        await prisma.plan.update({
          where: { id: p.id },
          data: { isPrimary: false, slug: null, bucketKey: key },
        });
      }
    }

    for (const p of arr) {
      const fromPath = `/plans/${slugify(p.uniqueName)}`;
      const toPath = `/${slug}`;
      if (fromPath === toPath) continue;
      await prisma.redirect.upsert({
        where: { fromPath },
        update: { toPath, reason: "migration" },
        create: { fromPath, toPath, reason: "migration", status: 301 },
      });
      redirects++;
    }
  }
  console.log(
    `Reconciled ${primaries} canonical pages + ${redirects} redirects across ${buckets.size} buckets.`,
  );
  return { primaries, redirects, buckets: buckets.size };
}
