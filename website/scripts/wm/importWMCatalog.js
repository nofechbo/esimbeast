/**
 * Import the full WM eSIM catalog into the Plan table with structured per-country
 * coverage. Reads the in-repo fixture (data/wm/), builds Plan rows, and upserts +
 * prunes WM plans (same contract as scripts/syncPlans.js). Run on STAGING first.
 *
 *   DATABASE_URL=<staging> node scripts/wm/importWMCatalog.js
 *   DATABASE_URL=<staging> WM_TWD_USD=0.031 WM_MARKUP=2 node scripts/wm/importWMCatalog.js
 *
 * Refresh the catalog fixture later from the live WM API (/Api/QuoteMg/myQueryAll)
 * — that path needs WM creds + IP-block care and is intentionally separate.
 */
import fs from "node:fs";
import { prisma } from "../../lib/db/prisma.js";
import { parseCoverageFamily } from "../../lib/wm/coverage.js";
import { buildMatcher } from "../../lib/wm/match.js";
import { buildWmPlan } from "../../lib/wm/build.js";

const DIR = process.env.WM_DATA_DIR || "data/wm";
const MIN_PLANS = 500; // safety: never prune if we somehow built far too few

async function main() {
  const esim = JSON.parse(fs.readFileSync(`${DIR}/wm-catalog.json`, "utf8"));
  const families = JSON.parse(fs.readFileSync(`${DIR}/wm-coverage.json`, "utf8")).map(parseCoverageFamily);
  const match = buildMatcher(families);

  const plans = [];
  let dropped = 0;
  const seen = new Set();
  for (const p of esim) {
    const plan = buildWmPlan(p, match(p));
    if (!plan) { dropped++; continue; }
    if (seen.has(plan.uniqueName)) continue; // de-dup
    seen.add(plan.uniqueName);
    plans.push(plan);
  }
  console.log(`Built ${plans.length} WM plans (${dropped} dropped) from ${esim.length} eSIM products.`);

  if (plans.length < MIN_PLANS) {
    console.error(`Aborting: only ${plans.length} plans built (< ${MIN_PLANS}). Refusing to prune.`);
    process.exit(1);
  }

  let upserted = 0;
  for (const plan of plans) {
    try {
      await prisma.plan.upsert({ where: { uniqueName: plan.uniqueName }, update: plan, create: plan });
      if (++upserted % 500 === 0) console.log(`  upserted ${upserted}/${plans.length}`);
    } catch (e) {
      console.error(`  ❌ ${plan.uniqueName}: ${e.message}`);
    }
  }
  console.log(`Upserted ${upserted} WM plans.`);

  // prune WM plans no longer in the catalog
  const keep = new Set(plans.map((p) => p.uniqueName));
  const existing = await prisma.plan.findMany({ where: { supplier: "WM" }, select: { uniqueName: true } });
  const stale = existing.map((p) => p.uniqueName).filter((n) => !keep.has(n));
  if (stale.length) {
    const { count } = await prisma.plan.deleteMany({ where: { supplier: "WM", uniqueName: { in: stale } } });
    console.log(`Pruned ${count} stale WM plans.`);
  }
  console.log("WM import complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error("WM import failed:", e); await prisma.$disconnect(); process.exit(1); });
