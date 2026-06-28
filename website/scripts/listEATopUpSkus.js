/**
 * Read-only: list the TOPUP_ packages EA will accept for a specific eSIM, so we
 * can see the real top-up codes + sizes for a region before wiring a product.
 *
 * EA scopes top-up codes to each eSIM (verified 2026-06-28) — there is no global
 * top-up list, and a base packageCode is NOT a valid top-up code. So pass the
 * eSIM's iccid (preferred) or a base packageCode:
 *
 *   ESIMACCESS_ACCESS_CODE=… node scripts/listEATopUpSkus.js --iccid=89103000...
 *   ESIMACCESS_ACCESS_CODE=… node scripts/listEATopUpSkus.js --packageCode=CKH025
 *
 * No orders are placed — this only calls /package/list with type:TOPUP.
 */
import { listTopUpPackages } from "../lib/refill/ea.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);

async function main() {
  if (!args.iccid && !args.packageCode) {
    console.error("Pass --iccid=… (preferred) or --packageCode=… — top-up codes are per-eSIM.");
    process.exit(2);
  }
  const list = await listTopUpPackages({ iccid: args.iccid, packageCode: args.packageCode });
  console.log(`${list.length} top-up packages valid for this eSIM:\n`);
  console.table(
    list
      .sort((a, b) => a.volumeMb - b.volumeMb || a.days - b.days)
      .map((p) => ({
        packageCode: p.packageCode,
        GB: +(p.volumeMb / 1000).toFixed(2),
        days: p.days,
        USD: p.priceUsd,
        name: p.name,
      })),
  );
  console.log("\nThe desiredIncrementMb in lib/refill/products.js is matched to one of these at lifecycle creation (pickTopUpPackage).");
}

main().catch((e) => { console.error(e); process.exit(1); });
