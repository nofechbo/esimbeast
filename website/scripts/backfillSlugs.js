#!/usr/bin/env node
// One-time migration to the clean-slug / redirect model, for plans that already
// exist in the DB. Idempotent — safe to re-run.
//
//   1. ensure every plan has a bucketKey
//   2. assign one isPrimary + clean slug per bucket
//   3. write 301s from each old /plans/<uniqueName> -> the bucket's canonical
//
// Steps 2–3 are exactly what runs after every sync, so this just calls the
// shared reconcile (single source of truth in syncPlansUtils).
//
//   DATABASE_URL=... node scripts/backfillSlugs.js
import "dotenv/config";
import { prisma } from "../lib/db/prisma.js";
import { buildBucketKey } from "../lib/slug.js";
import { reconcileSlugsAndPrimaries } from "./utils/syncPlansUtils.js";

async function main() {
  // 1) backfill bucketKey where missing (new column starts null)
  const missing = await prisma.plan.findMany({ where: { bucketKey: null } });
  console.log(`Setting bucketKey on ${missing.length} plans...`);
  for (const p of missing) {
    await prisma.plan.update({ where: { id: p.id }, data: { bucketKey: buildBucketKey(p) } });
  }

  // 2 + 3) canonical pages + redirects
  await reconcileSlugsAndPrimaries();
}

main()
  .catch((e) => {
    console.error("backfill failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
