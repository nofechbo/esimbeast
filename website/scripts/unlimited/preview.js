/**
 * Preview synthetic-unlimited prices per destination, using the BROWSER-CAPTURED
 * bytesim 2GB/day totals (data/competitor/bytesim.json) as the competitor anchor
 * and the live EA catalog for the cost floor.
 *
 *   node scripts/unlimited/preview.js --country=US        # one country, no DB (uses --cost)
 *   DATABASE_URL=… node scripts/unlimited/preview.js      # all captured countries, EA cost from DB
 *   DATABASE_URL=… node scripts/unlimited/preview.js --country=US
 *
 * EA cost/GB per country = min over that country's EA plans of supplierPrice/GB
 * (the marginal $/GB we pay to load + top up). Without a DB you can probe the
 * formula directly with --cost=<usdPerGb>.
 *
 * For each (country, duration) it prints the unlimited price, whether it's anchored
 * to the competitor (we undercut by 10¢) or pinned to the 2× floor, the initial EA
 * load bucket, and the implied profit multiple at 2.5GB/day fair-use.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  unlimitedPriceUsd,
  initialLoadGb,
  PROFIT_USAGE_GB_PER_DAY,
  PROFIT_MULTIPLE,
  UNDERCUT_USD,
} from "../../lib/unlimited/price.js";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bytesim = JSON.parse(
  readFileSync(path.join(__dirname, "../../data/competitor/bytesim.json"), "utf8")
);

/** Live EA min cost/GB (USD) per ISO country, from supplierPrice. */
async function eaCostPerGbByCountry(only) {
  const { prisma } = await import("../../lib/db/prisma.js");
  const plans = await prisma.plan.findMany({
    where: { supplier: "EA" },
    select: { supplierPrice: true, data: true, countryCodes: true },
  });
  const min = new Map(); // iso -> cheapest $/GB
  for (const p of plans) {
    const gb = Number(p.data);
    if (!p.supplierPrice || !gb) continue;
    const perGb = p.supplierPrice / 100 / gb;
    for (const iso of p.countryCodes || []) {
      if (only && iso !== only) continue;
      if (!min.has(iso) || perGb < min.get(iso)) min.set(iso, perGb);
    }
  }
  await prisma.$disconnect();
  return min;
}

function row(iso, days, totalUsd, costPerGb) {
  const r = unlimitedPriceUsd({ days, competitorTotalsUsd: [totalUsd], eaCostPerGbUsd: costPerGb });
  const load = initialLoadGb(days);
  // profit multiple at the priced fair-use usage (2.5GB/day)
  const cost = PROFIT_USAGE_GB_PER_DAY * days * costPerGb;
  const mult = cost ? r.priceUsd / cost : Infinity;
  // EA cost/GB ceiling at which we could undercut bytesim AND still clear 2× profit:
  //   floor ≤ anchor  ⇔  5·c·N ≤ bytesim − 0.10  ⇔  c ≤ (bytesim − 0.10)/(5N)
  const needCostGb =
    (totalUsd - UNDERCUT_USD) / (PROFIT_MULTIPLE * PROFIT_USAGE_GB_PER_DAY * days);
  return {
    iso,
    days,
    bytesim: totalUsd.toFixed(2),
    price: r.priceUsd.toFixed(2),
    source: r.source,
    load: `${load}GB`,
    "cost/GB": costPerGb.toFixed(3),
    "need≤": needCostGb.toFixed(3),
    mult: `${mult.toFixed(2)}×`,
  };
}

async function main() {
  const only = args.country;

  // No-DB probe: --country=US --cost=0.68
  let costByIso;
  if (args.cost !== undefined) {
    costByIso = new Map([[only, Number(args.cost)]]);
  } else {
    costByIso = await eaCostPerGbByCountry(only);
  }

  const isos = Object.keys(bytesim).filter((k) => k !== "_meta" && (!only || k === only));
  if (!isos.length) {
    console.log(only ? `No captured bytesim curve for ${only}.` : "No captured countries.");
    return;
  }

  const rows = [];
  let viableCountries = 0;
  for (const iso of isos) {
    const costPerGb = costByIso.get(iso);
    if (costPerGb == null) {
      console.log(`${iso}: no EA cost/GB (no EA coverage or supplierPrice) — skipped`);
      continue;
    }
    const curve = bytesim[iso];
    let anyAnchored = false;
    for (const d of Object.keys(curve).map(Number).sort((a, b) => a - b)) {
      const r = row(iso, d, curve[String(d)], costPerGb);
      if (r.source === "competitor") anyAnchored = true;
      rows.push(r);
    }
    if (anyAnchored) viableCountries++;
  }

  console.table(rows);
  console.log(
    `\n${rows.length} (country,duration) rows. Competitor-anchored rows undercut bytesim by $0.10; ` +
      `'floor' rows are pinned to 2× profit (bytesim cheaper than our floor — list but not a price war).`
  );
  console.log(`${viableCountries}/${isos.length} captured countries have ≥1 competitively-viable duration.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
