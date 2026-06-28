// The refill decision engine — PURE and side-effect free so it can be unit
// tested exhaustively (see engine.test.js). Given a lifecycle row and the latest
// usage reading from EA, it decides what the worker should do this tick: nothing,
// activate, top up, fire a paid safety top-up, or stop (cap/expire). All supplier
// calls and DB writes happen in the worker; this module only reasons.
//
// Coverage mode (see EsimLifecycle doc in schema.prisma): we cover the customer
// up to `managedCeilingMb = entitlement - gift` with base + paid top-ups, and let
// EA's end-of-pack gift fill the remainder. The gift is only trusted once we
// OBSERVE it land (EA's reported totalMb rises above our physicalCeilingMb). If a
// fast user approaches the managed ceiling before the gift shows, we fire a paid
// SAFETY top-up rather than risk a coverage gap.

import {
  ENTITLEMENT_TYPE,
  LIFECYCLE_STATE,
  REFILL_ACTION,
} from "./constants.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const MIN_POLL_SECONDS = 60;
const MAX_POLL_SECONDS = 600;

/** Hard consumption ceiling the customer is entitled to, in MB. */
export function entitlementCapMb(lc) {
  if (lc.entitlementType === ENTITLEMENT_TYPE.UNLIMITED) {
    return lc.fairUseCapMb ?? 0;
  }
  return lc.promisedDataMb ?? 0;
}

/**
 * @param {object} lc   EsimLifecycle row
 * @param {object} usage { usedMb, totalMb, status? } — latest EA usage/query
 * @param {object} opts  { now?: number(ms), prev?: {usedMb,atMs}, safetyBufferMb?: number }
 * @returns {{
 *   action: string, reason: string, topUpMb?: number, isSafety?: boolean,
 *   nextPollSeconds: number, updates: object
 * }}
 */
export function decideRefillAction(lc, usage, opts = {}) {
  const now = opts.now ?? Date.now();
  const cap = entitlementCapMb(lc);
  const usedMb = Math.max(lc.usedMb ?? 0, usage?.usedMb ?? 0);

  // EA's reported physical total (base + our top-ups + any landed gift). Falls
  // back to our own ceiling when EA hasn't reported a total yet.
  const reportedTotalMb = usage?.totalMb && usage.totalMb > 0
    ? usage.totalMb
    : lc.physicalCeilingMb;

  // How much of the gift we can SEE has landed (EA total above what we ordered).
  const giftLandedMb = Math.max(0, reportedTotalMb - lc.physicalCeilingMb);
  const giftDetectedMb = Math.max(lc.giftDetectedMb ?? 0, giftLandedMb);

  // Real headroom the carrier will actually honor right now.
  const realRemainingMb = Math.max(0, reportedTotalMb - usedMb);

  // pollUpdates is always safe to persist (no top-up assumed). The worker writes
  // the full `updates` only after a top-up actually succeeds; on failure it
  // writes pollUpdates + lastError so the increment is never recorded twice.
  const pollUpdates = {
    usedMb,
    giftDetectedMb,
    lastPolledAt: new Date(now),
  };
  const base = {
    pollUpdates,
    updates: { ...pollUpdates },
    nextPollSeconds: suggestPoll(lc, usedMb, now, opts.prev),
  };

  // --- Terminal checks first: never top up a capped/expired/failed eSIM ---
  if (
    lc.state === LIFECYCLE_STATE.CAPPED ||
    lc.state === LIFECYCLE_STATE.EXPIRED ||
    lc.state === LIFECYCLE_STATE.FAILED
  ) {
    return { ...base, action: REFILL_ACTION.NONE, reason: `terminal:${lc.state}` };
  }

  // Entitlement consumed — stop. (metered: got their GB; unlimited: hit fair-use)
  if (cap > 0 && usedMb >= cap) {
    return {
      ...base,
      action: REFILL_ACTION.CAP,
      reason: `used ${usedMb}MB >= entitlement cap ${cap}MB`,
      updates: { ...base.updates, state: LIFECYCLE_STATE.CAPPED },
    };
  }

  // --- Activation: first time we see the eSIM in use, start the clock ---
  const seenInUse = usedMb > 0 || usage?.status === "active";
  if (!lc.activatedAt && seenInUse) {
    const expiresAt = new Date(now + (lc.windowDays ?? 0) * DAY_MS);
    return {
      ...base,
      action: REFILL_ACTION.ACTIVATE,
      reason: "first usage observed",
      updates: {
        ...base.updates,
        state: LIFECYCLE_STATE.ACTIVE,
        activatedAt: new Date(now),
        expiresAt,
      },
    };
  }

  // Entitlement window elapsed — stop topping up (physical eSIM may outlive it).
  if (lc.expiresAt && now >= new Date(lc.expiresAt).getTime()) {
    return {
      ...base,
      action: REFILL_ACTION.EXPIRE,
      reason: `past expiresAt ${new Date(lc.expiresAt).toISOString()}`,
      updates: { ...base.updates, state: LIFECYCLE_STATE.EXPIRED },
    };
  }

  // Not active yet and not in use — nothing to do.
  if (!lc.activatedAt) {
    return { ...base, action: REFILL_ACTION.NONE, reason: "awaiting first use" };
  }

  // --- Refill logic ---
  const pct = lc.refillThresholdPct ?? 80;
  const triggerMb = (lc.physicalCeilingMb * pct) / 100;
  const safetyBufferMb =
    opts.safetyBufferMb ?? Math.round(lc.physicalCeilingMb * (1 - pct / 100));

  const nearOurCeiling = usedMb >= triggerMb;
  if (!nearOurCeiling) {
    return { ...base, action: REFILL_ACTION.NONE, reason: "headroom ok" };
  }

  // We're near the physical ceiling we've provisioned so far.
  if (lc.physicalCeilingMb < lc.managedCeilingMb) {
    // Routine growth: extend base -> managed ceiling with a paid top-up.
    const room = lc.managedCeilingMb - lc.physicalCeilingMb;
    const topUpMb = Math.min(lc.refillIncrementMb, room);
    return {
      ...base,
      action: REFILL_ACTION.TOPUP,
      isSafety: false,
      topUpMb,
      reason: `used ${usedMb}MB >= ${Math.round(triggerMb)}MB trigger; grow ${lc.physicalCeilingMb}->${lc.physicalCeilingMb + topUpMb}MB (managed ${lc.managedCeilingMb}MB)`,
      updates: {
        ...base.updates,
        state: LIFECYCLE_STATE.ACTIVE, // back to active once the top-up lands
        physicalCeilingMb: lc.physicalCeilingMb + topUpMb,
        topUpCount: (lc.topUpCount ?? 0) + 1,
        paidTopUpMb: (lc.paidTopUpMb ?? 0) + topUpMb,
      },
    };
  }

  // We've provisioned the full managed ceiling. The gap to entitlement is the
  // gift. If the gift has landed (enough real headroom), let it ride.
  if (realRemainingMb >= safetyBufferMb) {
    return {
      ...base,
      action: REFILL_ACTION.NONE,
      reason: `at managed ceiling; gift covering (${realRemainingMb}MB real headroom, ${giftDetectedMb}MB gift seen)`,
    };
  }

  // Gift is late and the user is closing on the managed ceiling. Cover with a
  // paid safety top-up (up to the entitlement cap) — reliability over margin.
  const roomToCap = cap > 0 ? cap - lc.physicalCeilingMb : lc.refillIncrementMb;
  if (roomToCap <= 0) {
    return {
      ...base,
      action: REFILL_ACTION.CAP,
      reason: "at entitlement cap, no room for safety top-up",
      updates: { ...base.updates, state: LIFECYCLE_STATE.CAPPED },
    };
  }
  const topUpMb = Math.min(lc.refillIncrementMb, roomToCap);
  return {
    ...base,
    action: REFILL_ACTION.SAFETY_TOPUP,
    isSafety: true,
    topUpMb,
    reason: `gift late (${realRemainingMb}MB real headroom < ${safetyBufferMb}MB buffer); paid safety top-up +${topUpMb}MB`,
    updates: {
      ...base.updates,
      state: LIFECYCLE_STATE.ACTIVE, // back to active once the top-up lands
      physicalCeilingMb: lc.physicalCeilingMb + topUpMb,
      topUpCount: (lc.topUpCount ?? 0) + 1,
      paidTopUpMb: (lc.paidTopUpMb ?? 0) + topUpMb,
      safetyTopUpCount: (lc.safetyTopUpCount ?? 0) + 1,
    },
  };
}

// Adaptive poll cadence: tighten as headroom shrinks, and — if we have a prior
// reading — project the burn rate so we always poll well before depletion.
function suggestPoll(lc, usedMb, now, prev) {
  const headroom = Math.max(0, lc.physicalCeilingMb - usedMb);
  const frac = lc.physicalCeilingMb > 0 ? headroom / lc.physicalCeilingMb : 1;

  let seconds;
  if (frac < 0.15) seconds = 60;
  else if (frac < 0.35) seconds = 180;
  else seconds = MAX_POLL_SECONDS;

  // Burn-rate projection: poll at ~1/3 of the time-to-ceiling so a top-up can be
  // ordered and applied with margin to spare.
  if (prev && prev.atMs && now > prev.atMs && usedMb > prev.usedMb) {
    const mbPerMs = (usedMb - prev.usedMb) / (now - prev.atMs);
    if (mbPerMs > 0) {
      const msToCeiling = headroom / mbPerMs;
      const projected = Math.round(msToCeiling / 3 / 1000);
      seconds = Math.min(seconds, projected);
    }
  }

  return Math.max(MIN_POLL_SECONDS, Math.min(MAX_POLL_SECONDS, seconds));
}
