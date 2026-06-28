/**
 * eSIMdb repricer: set EA plan list prices from scraped competitor prices.
 * For each EA plan that has a CompetitorPrice row, Plan.price = list (see
 * lib/esimdb/reprice.js). Plans without competitor data are left untouched.
 *
 *   DATABASE_URL=… node scripts/esimdb/reprice.js [--dry] [--minMargin=0.15]
 *
 * Run AFTER the scraper has populated CompetitorPrice. --dry prints changes only.
 */
import { prisma } from "../../lib/db/prisma.js";
import { esimdbListPriceCents } from "../../lib/esimdb/reprice.js";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const DRY = args.dry !== undefined;
const minMarginPct = args.minMargin ? Number(args.minMargin) : undefined;

async function main() {
  const comps = await prisma.competitorPrice.findMany();
  const byPlan = new Map(comps.map((c) => [c.planId, c]));
  const eaPlans = await prisma.plan.findMany({ where: { supplier: "EA" } });

  let updated = 0, floored = 0, skipped = 0;
  for (const plan of eaPlans) {
    const comp = byPlan.get(plan.id);
    if (!comp) { skipped++; continue; }
    const cost = plan.supplierPrice;
    if (cost == null) { skipped++; continue; }

    const { listCents, floored: hitFloor } = esimdbListPriceCents(comp.competitorCents, cost, { minMarginPct });
    if (hitFloor) floored++;
    if (listCents === plan.price) continue;

    if (DRY) {
      console.log(`  ${plan.uniqueName}: ${plan.price} → ${listCents}${hitFloor ? " (floored)" : ""}`);
    } else {
      await prisma.plan.update({ where: { id: plan.id }, data: { price: listCents } });
    }
    updated++;
  }
  console.log(
    `${DRY ? "[dry] " : ""}EA plans: ${eaPlans.length} · repriced ${updated} · floored ${floored} · no-competitor ${skipped}`,
  );
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
