/**
 * Read-only dry run: fetch the live EA catalog, flatten each package exactly like
 * writeEsimAccessToSheet does, run it through transformCsvDataToPlan, and report
 * how many import cleanly (vs. skipped, with reasons) + a price sanity summary.
 *
 * No DB writes, no sheet writes — just proves the import before you run syncPlans.
 *
 *   ESIMACCESS_ACCESS_CODE=… node scripts/previewEACatalog.js [--sample=5]
 */
import { fetchEsimAccessPackages } from "../lib/plans/fetchEsimAccessPackages.js";
import { transformCsvDataToPlan } from "./utils/syncPlansUtils.js";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const sampleN = Number(args.sample || 5);

// Mirror writeEsimAccessToSheet.flattenFieldValue so the preview matches the
// real sheet shape transformCsvDataToPlan will see.
function flatten(field, val) {
  if (field === "locationNetworkList") {
    return (val || [])
      .flatMap((loc) => loc.operatorList ?? [])
      .map((op) => `${op.operatorName} ${op.networkType}`)
      .join(", ");
  }
  if (Array.isArray(val)) return val.join(",");
  // Google-Sheets CSV delivers every cell as text — stringify scalars to match.
  return val == null ? "" : String(val);
}

function toSheetRow(pkg) {
  const row = {};
  for (const [k, v] of Object.entries(pkg)) row[k] = flatten(k, v);
  row["Price in cents"] = ""; // simulate the common case: no hand price
  return row;
}

async function main() {
  const pkgs = await fetchEsimAccessPackages();
  console.log(`Fetched ${pkgs.length} EA packages.\n`);

  let ok = 0;
  const skipped = [];
  const prices = [];
  const samples = [];

  for (const pkg of pkgs) {
    const plan = transformCsvDataToPlan(toSheetRow(pkg), "EA");
    if (!plan) {
      skipped.push(pkg.packageCode);
      continue;
    }
    ok++;
    prices.push(plan.price);
    if (samples.length < sampleN) {
      samples.push({
        name: plan.name,
        price$: (plan.price / 100).toFixed(2),
        cost$: (plan.supplierPrice / 100).toFixed(2),
        countries: plan.countryCodes.length,
        reloadable: plan.reloadable,
        note: plan.notification,
      });
    }
  }

  const min = Math.min(...prices), max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  console.log(`IMPORT PREVIEW`);
  console.log(`  would import : ${ok}`);
  console.log(`  skipped      : ${skipped.length}${skipped.length ? " -> " + skipped.slice(0, 10).join(",") : ""}`);
  console.log(`  price $       : min ${(min/100).toFixed(2)}  avg ${(avg/100).toFixed(2)}  max ${(max/100).toFixed(2)}`);
  console.log(`\nSample plans:`);
  console.table(samples);
}

main().catch((e) => { console.error(e); process.exit(1); });
