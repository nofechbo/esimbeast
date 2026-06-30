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
  floorFrom2GBDayUsd,
  floorFromTopupCostUsd,
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

// Each cost source returns Map<iso, { kind, val, basis }>:
//   kind "2gbday"  → val = EA 2GB/Day price per day; floor = val·N (min price = EA 2GB/Day)
//   kind "costgb"  → val = cheap total-data $/GB;    floor = 2·2·val·N (2× profit on top-up)

/** Min cost/GB per ISO from the Plan table (supplierPrice) — top-up (costgb) basis. */
async function eaFromDb(only) {
  const { prisma } = await import("../../lib/db/prisma.js");
  const plans = await prisma.plan.findMany({
    where: { supplier: "EA" },
    select: { supplierPrice: true, data: true, countryCodes: true },
  });
  const min = new Map();
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
  const out = new Map();
  for (const [iso, v] of min) out.set(iso, { kind: "costgb", val: v, basis: `$${v.toFixed(3)}/GB` });
  return out;
}

/** Cheapest total-data $/GB per ISO from the live EA catalog — top-up (costgb) basis. */
async function eaFromTopup(only) {
  const { fetchEsimAccessPackages } = await import("../../lib/plans/fetchEsimAccessPackages.js");
  const pkgs = await fetchEsimAccessPackages();
  const min = new Map();
  for (const p of pkgs) {
    if (p.dataType != null && p.dataType !== 1) continue; // 1 = total-data (refillable)
    const gb = Number(p.volume) / BYTES_PER_GB;
    const usd = Number(p.price) / EA_PRICE_PER_USD;
    if (!gb || !usd) continue;
    const perGb = usd / gb;
    for (const iso of p.resolvedCountryCodes || []) {
      if (only && iso !== only) continue;
      if (!min.has(iso) || perGb < min.get(iso)) min.set(iso, perGb);
    }
  }
  const out = new Map();
  for (const [iso, v] of min) out.set(iso, { kind: "costgb", val: v, basis: `$${v.toFixed(3)}/GB top-up` });
  return out;
}

/**
 * Min price = EA's own "2GB/Day" daily-plan price (the conservative real cost of
 * delivering the 2GB/day fair-use). Per country: cheapest "2GB/Day" plan, per day.
 * Countries with no 2GB/Day plan fall back to the cheapest total-data $/GB.
 */
async function eaFrom2GBDay(only) {
  const { fetchEsimAccessPackages } = await import("../../lib/plans/fetchEsimAccessPackages.js");
  const pkgs = await fetchEsimAccessPackages();
  const daily = new Map(); // iso -> cheapest 2GB/Day per-day USD
  const totalPerGb = new Map(); // fallback: cheapest total-data $/GB
  for (const p of pkgs) {
    const usd = Number(p.price) / EA_PRICE_PER_USD;
    const gb = Number(p.volume) / BYTES_PER_GB;
    const ccs = p.resolvedCountryCodes || [];
    if (/2\s*GB\s*\/\s*day/i.test(p.name || "") && Math.abs(gb - 2) < 0.6) {
      const perDay = usd / Math.max(1, Number(p.duration) || 1);
      for (const iso of ccs) {
        if (only && iso !== only) continue;
        if (!daily.has(iso) || perDay < daily.get(iso)) daily.set(iso, perDay);
      }
    }
    if ((p.dataType == null || p.dataType === 1) && gb && usd) {
      const perGb = usd / gb;
      for (const iso of ccs) {
        if (only && iso !== only) continue;
        if (!totalPerGb.has(iso) || perGb < totalPerGb.get(iso)) totalPerGb.set(iso, perGb);
      }
    }
  }
  const out = new Map();
  for (const iso of new Set([...daily.keys(), ...totalPerGb.keys()])) {
    if (daily.has(iso)) out.set(iso, { kind: "2gbday", val: daily.get(iso), basis: `EA 2GB/Day $${daily.get(iso).toFixed(2)}/d` });
    else out.set(iso, { kind: "costgb", val: totalPerGb.get(iso), basis: `$${totalPerGb.get(iso).toFixed(3)}/GB (no 2GB/Day)` });
  }
  return out;
}

function floorOf(c, days) {
  return c.kind === "2gbday" ? floorFrom2GBDayUsd(c.val, days) : floorFromTopupCostUsd(c.val, days);
}

function row(iso, days, totalUsd, c) {
  const floorUsd = floorOf(c, days);
  const r = unlimitedPriceUsd({ days, competitorTotalsUsd: [totalUsd], floorUsd });
  return {
    iso,
    days,
    bytesim: totalUsd.toFixed(2),
    floor: floorUsd.toFixed(2),
    price: r.priceUsd.toFixed(2),
    source: r.source,
    load: `${initialLoadGb(days)}GB`,
    basis: c.basis,
  };
}

async function main() {
  const only = args.country;

  // Floor basis: default = EA "2GB/Day" catalog price as the minimum price.
  //   --source=topup → 2× profit on cheap total-data top-up cost
  //   --source=db    → same, from the Plan table
  //   --cost=<usdPerGb> → flat probe (top-up basis)
  let costByIso, costSrc;
  if (args.cost !== undefined) {
    costByIso = new Map([[only, { kind: "costgb", val: Number(args.cost), basis: `flat $${args.cost}/GB` }]]);
    costSrc = `flat --cost=${args.cost} (top-up basis)`;
  } else if (args.source === "db") {
    costByIso = await eaFromDb(only);
    costSrc = "DB Plan.supplierPrice (2× top-up basis)";
  } else if (args.source === "topup") {
    costByIso = await eaFromTopup(only);
    costSrc = "EA total-data $/GB (2× cheap top-up basis)";
  } else if (process.env.ESIMACCESS_ACCESS_CODE || args.source === "ea") {
    costByIso = await eaFrom2GBDay(only);
    costSrc = "EA 2GB/Day catalog price = minimum price";
  } else {
    costByIso = await eaFromDb(only);
    costSrc = "DB Plan.supplierPrice (2× top-up basis)";
  }
  console.log(`Floor basis: ${costSrc}\n`);

  const isos = Object.keys(bytesim).filter((k) => k !== "_meta" && (!only || k === only));
  if (!isos.length) {
    console.log(only ? `No captured bytesim curve for ${only}.` : "No captured countries.");
    return;
  }

  const rows = [];
  const byCountry = new Map(); // iso -> { anchored:[days], floored:[days] }
  for (const iso of isos) {
    const c = costByIso.get(iso);
    if (c == null) {
      console.log(`${iso}: no EA coverage in catalog — skipped`);
      continue;
    }
    const curve = bytesim[iso];
    const stat = { anchored: [], floored: [], list: [] };
    for (const d of Object.keys(curve).map(Number).sort((a, b) => a - b)) {
      const r = row(iso, d, curve[String(d)], c);
      if (r.source === "competitor") { stat.anchored.push(d); stat.list.push({ d, price: r.price }); }
      else stat.floored.push(d);
      rows.push(r);
    }
    byCountry.set(iso, stat);
  }

  console.table(rows);
  console.log(
    `\n${rows.length} (country,duration) rows. 'floor' = our minimum price is ABOVE bytesim ` +
      `(we'd be uncompetitive); 'competitor' = we undercut bytesim by $0.10 while staying at/above the floor.`
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

  // LISTABLE SKUs — every competitive (country, duration), full AND partial, that
  // we should actually create as an unlimited product, with its price.
  let skuCount = 0;
  const lines = [];
  for (const [iso, s] of byCountry) {
    if (!s.list.length) continue;
    skuCount += s.list.length;
    lines.push(`  ${iso}: ${s.list.map((x) => `${x.d}d $${x.price}`).join(", ")}`);
  }
  console.log(`\n── listable unlimited SKUs (full + partials): ${skuCount} ──`);
  for (const l of lines) console.log(l);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
