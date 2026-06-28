import { prisma } from "../lib/db/prisma.js";
import { queryUsage, topUp, topUpTxnId } from "../lib/refill/ea.js";
import { decideRefillAction } from "../lib/refill/engine.js";
import { LIFECYCLE_STATE, REFILL_ACTION } from "../lib/refill/constants.js";

/**
 * Cronjob: refillManagedEsims
 *
 * Drives every managed (auto-refill) eSIM one tick: query EA usage, ask the pure
 * engine what to do, and execute it — top up just before a ceiling, fire a paid
 * safety top-up if EA's end-of-pack gift is late, or stop at cap/expiry.
 *
 * Reliability rules baked in here:
 *   - top-ups use a DETERMINISTIC idempotency key (refill-<id>-<seq>) so a retry
 *     or an overlapping run can never double-add data (pending EA idempotency
 *     verification — see lib/refill/ea.js).
 *   - the physical-ceiling increment + counters are persisted ONLY after EA
 *     confirms the top-up; on failure we record lastError and retry next tick.
 *   - a top-up failure never strands the loop: it stays ACTIVE and is retried.
 *
 * Safe to run on an interval (e.g. every minute). Keyed on esimTranNo.
 */

const KEY_FIELD = process.env.EA_TOPUP_KEY_FIELD || "iccid"; // resolved by smoke test
const MAX_TOPUP_FAILURES = 5;

async function tick(lc) {
  if (!lc.esimTranNo) {
    console.log(`lifecycle ${lc.id}: no esimTranNo yet, skipping`);
    return;
  }

  let usage;
  try {
    usage = await queryUsage(lc.esimTranNo);
  } catch (err) {
    console.error(`lifecycle ${lc.id}: usage query failed:`, err.message);
    return; // transient — try again next tick, no state change
  }
  if (!usage) {
    console.log(`lifecycle ${lc.id}: EA has no usage yet`);
    return;
  }

  const decision = decideRefillAction(lc, usage, {
    prev: lc.lastPolledAt
      ? { usedMb: lc.usedMb, atMs: new Date(lc.lastPolledAt).getTime() }
      : undefined,
  });

  const isTopUp =
    decision.action === REFILL_ACTION.TOPUP ||
    decision.action === REFILL_ACTION.SAFETY_TOPUP;

  if (!isTopUp) {
    await prisma.esimLifecycle.update({ where: { id: lc.id }, data: decision.updates });
    console.log(
      `lifecycle ${lc.id}: ${decision.action} (${decision.reason}); next poll ~${decision.nextPollSeconds}s`,
    );
    return;
  }

  // --- Top-up path: order from EA first, persist the increment only on success ---
  if (!lc.topUpSku) {
    await prisma.esimLifecycle.update({
      where: { id: lc.id },
      data: { ...decision.pollUpdates, lastError: "no topUpSku configured" },
    });
    console.error(`lifecycle ${lc.id}: ${decision.action} needed but no topUpSku set`);
    return;
  }

  const seq = (lc.topUpCount ?? 0) + 1;
  const txnId = topUpTxnId(lc.id, seq);
  console.log(
    `lifecycle ${lc.id}: ${decision.action} +${decision.topUpMb}MB via ${lc.topUpSku} (txn ${txnId}) — ${decision.reason}`,
  );

  try {
    await topUp({
      iccid: lc.iccid,
      esimTranNo: lc.esimTranNo,
      packageCode: lc.topUpSku,
      transactionId: txnId,
      keyField: KEY_FIELD,
    });
  } catch (err) {
    const failures = await recordTopUpFailure(lc, decision, err);
    console.error(
      `lifecycle ${lc.id}: top-up FAILED (${failures}/${MAX_TOPUP_FAILURES}):`,
      err.message,
    );
    return;
  }

  await prisma.esimLifecycle.update({
    where: { id: lc.id },
    data: { ...decision.updates, lastError: null },
  });
  console.log(`lifecycle ${lc.id}: top-up applied, ceiling -> ${decision.updates.physicalCeilingMb}MB`);
}

async function recordTopUpFailure(lc, decision, err) {
  // Count consecutive failures via lastError prefix; flip to FAILED past the cap
  // so a persistently broken eSIM surfaces for a human instead of looping.
  const prevFailures = Number((lc.lastError || "").match(/^\[(\d+)\]/)?.[1] || 0);
  const failures = prevFailures + 1;
  await prisma.esimLifecycle.update({
    where: { id: lc.id },
    data: {
      ...decision.pollUpdates,
      state: failures >= MAX_TOPUP_FAILURES ? LIFECYCLE_STATE.FAILED : LIFECYCLE_STATE.ACTIVE,
      lastError: `[${failures}] ${err.message}`.slice(0, 500),
    },
  });
  return failures;
}

async function main() {
  console.log("Starting managed-eSIM refill pass...\n");
  const managed = await prisma.esimLifecycle.findMany({
    where: {
      supplier: "EA",
      state: { in: [LIFECYCLE_STATE.PROVISIONED, LIFECYCLE_STATE.ACTIVE] },
    },
    orderBy: { id: "asc" },
  });
  console.log(`Found ${managed.length} active managed eSIMs.`);

  for (const lc of managed) {
    try {
      await tick(lc);
    } catch (err) {
      console.error(`lifecycle ${lc.id}: unexpected error:`, err);
    }
  }
  console.log("\nRefill pass complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Refill pass crashed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
