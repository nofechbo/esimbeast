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

// EA API price unit = 1/10000 USD; volume in bytes.
const EA_PRICE_PER_USD = 10000;
const BYTES_PER_GB = 1024 ** 3;

/** Live EA min cost/GB (USD) per ISO country, from the Plan table (supplierPrice). */
async function eaCostPerGbFromDb(only) {
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

/**
 * Live EA min cost/GB (USD) per ISO, straight from the EA catalog (/package/list).
 * This is the cost source of truth (what we actually pay to load/top up), so it
 * doesn't need a populated DB — only ESIMACCESS_ACCESS_CODE in env.
 * Restricted to total-data (capped) packages — the only refillable kind, which is
 * what the unlimited top-up engine buys.
 */
async function eaCostPerGbFromApi(only) {
  const { fetchEsimAccessPackages } = await import("../../lib/plans/fetchEsimAccessPackages.js");
  const pkgs = await fetchEsimAccessPackages();
  const min = new Map();
  for (const p of pkgs) {
    // dataType 1 = "Data in Total" (capped/refillable). Some payloads omit it; fall back to volume>0.
    if (p.dataType != null && p.dataType !== 1) continue;
    const gb = Number(p.volume) / BYTES_PER_GB;
    const usd = Number(p.price) / EA_PRICE_PER_USD;
    if (!gb || !usd) continue;
    const perGb = usd / gb;
    for (const iso of p.resolvedCountryCodes || []) {
      if (only && iso !== only) continue;
      if (!min.has(iso) || perGb < min.get(iso)) min.set(iso, perGb);
    }
  }
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

  // Cost source: --cost (probe), EA API (default if ESIMACCESS_ACCESS_CODE set), else DB.
  let costByIso, costSrc;
  if (args.cost !== undefined) {
    costByIso = new Map([[only, Number(args.cost)]]);
    costSrc = `flat --cost=${args.cost}`;
  } else if (args.source === "db") {
    costByIso = await eaCostPerGbFromDb(only);
    costSrc = "DB Plan.supplierPrice";
  } else if (process.env.ESIMACCESS_ACCESS_CODE || args.source === "ea") {
    costByIso = await eaCostPerGbFromApi(only);
    costSrc = "EA /package/list (live)";
  } else {
    costByIso = await eaCostPerGbFromDb(only);
    costSrc = "DB Plan.supplierPrice";
  }
  console.log(`EA cost/GB source: ${costSrc}\n`);

  const isos = Object.keys(bytesim).filter((k) => k !== "_meta" && (!only || k === only));
  if (!isos.length) {
    console.log(only ? `No captured bytesim curve for ${only}.` : "No captured countries.");
    return;
  }

  const rows = [];
  const byCountry = new Map(); // iso -> { anchored:[days], floored:[days] }
  for (const iso of isos) {
    const costPerGb = costByIso.get(iso);
    if (costPerGb == null) {
      console.log(`${iso}: no EA cost/GB (no EA coverage in catalog) — skipped`);
      continue;
    }
    const curve = bytesim[iso];
    const stat = { anchored: [], floored: [] };
    for (const d of Object.keys(curve).map(Number).sort((a, b) => a - b)) {
      const r = row(iso, d, curve[String(d)], costPerGb);
      (r.source === "competitor" ? stat.anchored : stat.floored).push(d);
      rows.push(r);
    }
    byCountry.set(iso, stat);
  }

  console.table(rows);
  console.log(
    `\n${rows.length} (country,duration) rows. NOTE: nothing here is sold below cost — the ` +
      `floor guarantees 2× profit at ${PROFIT_USAGE_GB_PER_DAY}GB/day. 'floor' = priced ABOVE bytesim ` +
      `(profitable but not a price war); 'competitor' = we undercut bytesim by $0.10 AND still clear 2×.`
  );

  // Verdict rollup, sorted worst-first so non-competitive destinations surface.
  const fully = [], partial = [], none = [];
  for (const [iso, s] of byCountry) {
    const n = s.anchored.length, total = n + s.floored.length;
    if (n === 0) none.push(iso);
    else if (n === total) fully.push(iso);
    else partial.push(`${iso}(${s.anchored.join("/")}d)`);
  }
  console.log(`\n── verdict ──`);
  console.log(`✅ competitive at ALL durations: ${fully.join(", ") || "—"}`);
  console.log(`🟡 competitive only at: ${partial.join(", ") || "—"}`);
  console.log(`❌ NOT competitive at any duration (EA cost/GB > bytesim — don't list unlimited): ${none.join(", ") || "—"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
