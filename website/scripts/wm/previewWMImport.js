/**
 * Read-only dry run: build Plan rows for the full WM eSIM catalog (coverage +
 * pricing) and report counts, price distribution, coverage attach-rate, and
 * samples. No DB, no API. Lets you sanity-check pricing before any live import.
 *
 *   node scripts/wm/previewWMImport.js
 *   WM_TWD_USD=0.031 WM_MARKUP=2 node scripts/wm/previewWMImport.js
 */
import fs from "node:fs";
import { parseCoverageFamily } from "../../lib/wm/coverage.js";
import { buildMatcher } from "../../lib/wm/match.js";
import { buildWmPlan, TWD_USD, WM_MARKUP } from "../../lib/wm/build.js";

const D = `${process.env.HOME}/pingwe-esimbeast/wm-data`;
const esim = JSON.parse(fs.readFileSync(`${D}/wm-catalog.json`, "utf8")).filter((p) => p.leSIM);
const cov = JSON.parse(fs.readFileSync(`${D}/wm-coverage.json`, "utf8")).map(parseCoverageFamily);
const match = buildMatcher(cov);

let built = 0, dropped = 0, withCoverage = 0, multiCountry = 0, daily = 0, unlimited = 0, withPhone = 0;
const prices = [], dupCheck = new Set(), dups = [];
const samples = [];

for (const p of esim) {
  const plan = buildWmPlan(p, match(p));
  if (!plan) { dropped++; continue; }
  built++;
  prices.push(plan.price);
  if (plan.coverage) withCoverage++;
  if (plan.countryCodes.length > 1) multiCountry++;
  if (plan.dailyDataCap) daily++;
  if (plan.data === 0) unlimited++;
  if (plan.hasPhone) withPhone++;
  if (dupCheck.has(plan.uniqueName)) dups.push(plan.uniqueName); else dupCheck.add(plan.uniqueName);
  if (samples.length < 5 && plan.coverage && plan.countryCodes.length > 3) {
    samples.push(plan);
  }
}

const usd = (c) => "$" + (c / 100).toFixed(2);
const sorted = [...prices].sort((a, b) => a - b);
const pct = (q) => sorted[Math.floor(sorted.length * q)];

console.log(`WM IMPORT DRY RUN  (TWD→USD ${TWD_USD}, markup ${WM_MARKUP}×)\n`);
console.log(`  built plans     : ${built} / ${esim.length}`);
console.log(`  dropped (no countries / price): ${dropped}`);
console.log(`  with structured coverage      : ${withCoverage} (${Math.round(withCoverage / built * 100)}%)`);
console.log(`  multi-country   : ${multiCountry}   daily: ${daily}   unlimited: ${unlimited}   phone-flag: ${withPhone}`);
console.log(`  duplicate uniqueNames         : ${dups.length}`);
console.log(`  retail price    : min ${usd(sorted[0])}  p50 ${usd(pct(0.5))}  p90 ${usd(pct(0.9))}  max ${usd(sorted[sorted.length - 1])}`);

console.log(`\n  sample multi-country plans:`);
for (const s of samples) {
  console.log(`   • ${s.name.slice(0, 46)}`);
  console.log(`     ${s.countryCodes.length} countries · ${usd(s.supplierPrice)} cost → ${usd(s.price)} retail · ${s.days}d · ${s.data === 0 ? "unlimited" : s.fup} · phone=${s.hasPhone}`);
  console.log(`     coverage e.g. ${s.coverage.byCountry.slice(0, 3).map((c) => `${c.countryCode}:${(c.operators || []).slice(0, 2).join("/")}`).join("  ")}`);
}
