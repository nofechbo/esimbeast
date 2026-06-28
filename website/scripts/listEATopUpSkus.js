/**
 * Read-only: list EA packages that support top-up (supportTopUpType == 2), with
 * their size/duration, so we can fill the `*Sku` codes in lib/refill/products.js.
 *
 *   ESIMACCESS_ACCESS_CODE=... node scripts/listEATopUpSkus.js [--maxGb=5]
 *
 * No orders are placed — this only calls /package/list.
 */
import { fetchEsimAccessPackages } from "../lib/plans/fetchEsimAccessPackages.js";
import { isEAPlanReloadable } from "./utils/parsers.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);
const maxGb = args.maxGb ? Number(args.maxGb) : Infinity;

function gb(volumeBytes) {
  return volumeBytes ? +(volumeBytes / 1_000_000 / 1000).toFixed(2) : 0;
}

async function main() {
  const pkgs = await fetchEsimAccessPackages();
  const reloadable = pkgs
    .filter((p) => isEAPlanReloadable(p.supportTopUpType))
    .map((p) => ({
      packageCode: p.packageCode,
      name: p.name,
      gb: gb(p.volume),
      days: p.duration,
      price: p.price, // EA units (1/10000 USD)
      countries: (p.resolvedCountryCodes || []).slice(0, 6).join(","),
    }))
    .filter((p) => p.gb <= maxGb)
    .sort((a, b) => a.gb - b.gb || a.days - b.days);

  console.log(`${reloadable.length} top-up-able EA packages${Number.isFinite(maxGb) ? ` <= ${maxGb}GB` : ""}:\n`);
  console.table(reloadable);
  console.log("\nDrop the right packageCode(s) into MANAGED_PRODUCTS in lib/refill/products.js.");
}

main().catch((e) => { console.error(e); process.exit(1); });
