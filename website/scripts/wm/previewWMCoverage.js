/**
 * Read-only: run the WM coverage parser over the cached after-sales families and
 * report how cleanly per-country operators + ISO codes resolve. No DB, no API.
 *
 *   node scripts/wm/previewWMCoverage.js [path-to-wm-coverage.json]
 */
import fs from "node:fs";
import { parseCoverageFamily } from "../../lib/wm/coverage.js";

const path =
  process.argv[2] || "data/wm/wm-coverage.json";

const families = JSON.parse(fs.readFileSync(path, "utf8"));
const parsed = families.map(parseCoverageFamily);

let countriesSeen = 0,
  countriesResolved = 0,
  unresolved = new Set();
for (const f of parsed) {
  for (const c of f.byCountry) {
    countriesSeen++;
    if (c.countryCode) countriesResolved++;
    else if (c.country) unresolved.add(c.country);
  }
}

console.log(`Families: ${parsed.length}  (multi-country: ${parsed.filter((f) => f.isMulti).length})`);
console.log(`Per-country carrier rows: ${countriesSeen}  | ISO resolved: ${countriesResolved} (${Math.round((countriesResolved / countriesSeen) * 100)}%)`);
console.log(`Families with phone/SMS note: ${parsed.filter((f) => f.hasPhone).length}`);
console.log(`Unresolved country labels (${unresolved.size}): ${[...unresolved].slice(0, 20).join(" | ")}`);

console.log(`\n--- sample: a multi-country family ---`);
const eu = parsed.find((f) => f.countryCodes.length > 5);
console.log(`name: ${eu.name}  | ${eu.countryCodes.length} countries  | network ${eu.network} | apn ${eu.apn} | phone ${eu.hasPhone}`);
eu.byCountry.slice(0, 6).forEach((c) =>
  console.log(`   ${c.countryCode || "??"}  ${c.country.padEnd(16)} -> ${(c.operators || []).join(", ")}`),
);

console.log(`\n--- sample: a single-country family ---`);
const tw = parsed.find((f) => !f.isMulti);
console.log(JSON.stringify(tw, null, 1));
