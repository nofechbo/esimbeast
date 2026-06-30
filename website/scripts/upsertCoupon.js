/**
 * Create or update a coupon. Run on staging/prod with DATABASE_URL set.
 *
 *   DATABASE_URL=… node scripts/upsertCoupon.js --code=ESIMDB10 --type=percent --value=10 \
 *     [--note="eSIMdb partner"] [--expires=2026-12-31] [--max=1000] [--min=500] [--inactive]
 *
 * type=percent → value is 1-100 (% off). type=fixed → value is cents off.
 */
import { prisma } from "../lib/db/prisma.js";
import { normalizeCode, COUPON_TYPE } from "../lib/coupon.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

async function main() {
  const code = normalizeCode(args.code);
  const type = args.type;
  const value = parseInt(args.value, 10);
  if (!code || ![COUPON_TYPE.PERCENT, COUPON_TYPE.FIXED].includes(type) || !Number.isInteger(value)) {
    console.error("Required: --code, --type=percent|fixed, --value=<int>");
    process.exit(2);
  }
  if (type === COUPON_TYPE.PERCENT && (value < 1 || value > 100)) {
    console.error("percent value must be 1-100");
    process.exit(2);
  }

  const data = {
    code,
    type,
    value,
    active: !args.inactive,
    note: args.note ? String(args.note) : null,
    expiresAt: args.expires ? new Date(args.expires) : null,
    maxRedemptions: args.max ? parseInt(args.max, 10) : null,
    minAmountCents: args.min ? parseInt(args.min, 10) : null,
    supplierScope: args.supplier ? String(args.supplier).toUpperCase() : null,
    productScope: args.productScope ? String(args.productScope).toLowerCase() : null,
  };

  const c = await prisma.coupon.upsert({ where: { code }, update: data, create: data });
  console.log(
    `Coupon ${c.code}: ${c.type === "percent" ? c.value + "% off" : "$" + (c.value / 100).toFixed(2) + " off"}` +
      ` · active=${c.active} · redemptions=${c.redemptions}` +
      (c.expiresAt ? ` · expires ${c.expiresAt.toISOString().slice(0, 10)}` : "") +
      (c.maxRedemptions ? ` · max ${c.maxRedemptions}` : ""),
  );
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
