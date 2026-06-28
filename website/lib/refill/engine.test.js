import { test } from "node:test";
import assert from "node:assert/strict";
import { decideRefillAction, entitlementCapMb } from "./engine.js";
import {
  ENTITLEMENT_TYPE,
  LIFECYCLE_STATE,
  REFILL_ACTION,
} from "./constants.js";

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

// Baseline: a 10GB / 30-day metered order, coverage mode.
//   promised 10000MB, gift 2000MB -> managed ceiling 8000MB.
//   base 5000MB provisioned, top-up increment 3000MB, trigger at 80%.
function metered(overrides = {}) {
  return {
    id: 1,
    entitlementType: ENTITLEMENT_TYPE.METERED,
    promisedDataMb: 10000,
    fairUseCapMb: null,
    windowDays: 30,
    giftMb: 2000,
    physicalCeilingMb: 5000,
    giftDetectedMb: 0,
    managedCeilingMb: 8000,
    refillThresholdPct: 80,
    refillIncrementMb: 3000,
    state: LIFECYCLE_STATE.ACTIVE,
    usedMb: 0,
    activatedAt: new Date(NOW - DAY),
    expiresAt: new Date(NOW + 29 * DAY),
    topUpCount: 0,
    paidTopUpMb: 0,
    safetyTopUpCount: 0,
    ...overrides,
  };
}

test("entitlementCapMb: metered uses promised, unlimited uses fair-use", () => {
  assert.equal(entitlementCapMb(metered()), 10000);
  assert.equal(
    entitlementCapMb({
      entitlementType: ENTITLEMENT_TYPE.UNLIMITED,
      fairUseCapMb: 5000,
    }),
    5000,
  );
});

test("activation: first usage stamps activatedAt + expiresAt and goes active", () => {
  const lc = metered({ state: LIFECYCLE_STATE.PROVISIONED, activatedAt: null, expiresAt: null });
  const r = decideRefillAction(lc, { usedMb: 50, totalMb: 5000 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.ACTIVATE);
  assert.equal(r.updates.state, LIFECYCLE_STATE.ACTIVE);
  assert.equal(r.updates.activatedAt.getTime(), NOW);
  assert.equal(r.updates.expiresAt.getTime(), NOW + 30 * DAY);
});

test("provisioned + no usage = no-op, awaiting first use", () => {
  const lc = metered({ state: LIFECYCLE_STATE.PROVISIONED, activatedAt: null, expiresAt: null });
  const r = decideRefillAction(lc, { usedMb: 0, totalMb: 0 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.NONE);
});

test("comfortable headroom = no-op", () => {
  const r = decideRefillAction(metered({ usedMb: 1000 }), { usedMb: 1000, totalMb: 5000 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.NONE);
});

test("routine top-up: grow base->managed when near the base ceiling", () => {
  // used 4000 == 80% of 5000 -> trigger; physical 5000 < managed 8000
  const r = decideRefillAction(metered({ usedMb: 4000 }), { usedMb: 4000, totalMb: 5000 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.TOPUP);
  assert.equal(r.isSafety, false);
  assert.equal(r.topUpMb, 3000); // min(increment 3000, room 3000)
  assert.equal(r.updates.physicalCeilingMb, 8000);
  assert.equal(r.updates.paidTopUpMb, 3000);
  assert.equal(r.updates.state, LIFECYCLE_STATE.ACTIVE);
  // failure path must not record the increment
  assert.equal(r.pollUpdates.physicalCeilingMb, undefined);
  assert.equal(r.pollUpdates.paidTopUpMb, undefined);
});

test("routine top-up clamps to the managed ceiling, never overshoots", () => {
  // physical 7000, managed 8000 -> only 1000 of room even though increment is 3000
  const r = decideRefillAction(
    metered({ physicalCeilingMb: 7000, usedMb: 5600 }),
    { usedMb: 5600, totalMb: 7000 },
    { now: NOW },
  );
  assert.equal(r.action, REFILL_ACTION.TOPUP);
  assert.equal(r.topUpMb, 1000);
  assert.equal(r.updates.physicalCeilingMb, 8000);
});

test("at managed ceiling, gift has landed -> let it ride (no-op)", () => {
  // physical == managed 8000, EA reports total 10000 (gift landed), used 6500
  const r = decideRefillAction(
    metered({ physicalCeilingMb: 8000, usedMb: 6500 }),
    { usedMb: 6500, totalMb: 10000 },
    { now: NOW },
  );
  assert.equal(r.action, REFILL_ACTION.NONE);
  assert.equal(r.updates.giftDetectedMb, 2000);
});

test("at managed ceiling, gift LATE + user closing in -> paid safety top-up", () => {
  // physical == managed 8000, EA still reports 8000 (no gift), used 6500
  // real headroom 1500 < buffer 1600 -> safety
  const r = decideRefillAction(
    metered({ physicalCeilingMb: 8000, usedMb: 6500 }),
    { usedMb: 6500, totalMb: 8000 },
    { now: NOW },
  );
  assert.equal(r.action, REFILL_ACTION.SAFETY_TOPUP);
  assert.equal(r.isSafety, true);
  assert.equal(r.topUpMb, 2000); // min(increment 3000, roomToCap 10000-8000)
  assert.equal(r.updates.safetyTopUpCount, 1);
  assert.equal(r.updates.physicalCeilingMb, 10000);
});

test("entitlement consumed -> CAP, never tops up past what they paid for", () => {
  const r = decideRefillAction(
    metered({ physicalCeilingMb: 10000, usedMb: 10000 }),
    { usedMb: 10000, totalMb: 10000 },
    { now: NOW },
  );
  assert.equal(r.action, REFILL_ACTION.CAP);
  assert.equal(r.updates.state, LIFECYCLE_STATE.CAPPED);
});

test("window elapsed -> EXPIRE (physical eSIM may outlive the entitlement)", () => {
  const lc = metered({ usedMb: 1000, expiresAt: new Date(NOW - DAY) });
  const r = decideRefillAction(lc, { usedMb: 1000, totalMb: 5000 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.EXPIRE);
  assert.equal(r.updates.state, LIFECYCLE_STATE.EXPIRED);
});

test("terminal states are never refilled", () => {
  for (const state of [LIFECYCLE_STATE.CAPPED, LIFECYCLE_STATE.EXPIRED, LIFECYCLE_STATE.FAILED]) {
    const r = decideRefillAction(
      metered({ state, usedMb: 4000 }),
      { usedMb: 4000, totalMb: 5000 },
      { now: NOW },
    );
    assert.equal(r.action, REFILL_ACTION.NONE, `state ${state}`);
  }
});

test("unlimited: caps at the 5GB fair-use ceiling", () => {
  const lc = metered({
    entitlementType: ENTITLEMENT_TYPE.UNLIMITED,
    promisedDataMb: null,
    fairUseCapMb: 5000,
    managedCeilingMb: 5000,
    windowDays: 3,
    giftMb: 0,
    usedMb: 5000,
  });
  const r = decideRefillAction(lc, { usedMb: 5000, totalMb: 5000 }, { now: NOW });
  assert.equal(r.action, REFILL_ACTION.CAP);
});

test("adaptive poll: tighter interval as headroom shrinks", () => {
  const far = decideRefillAction(metered({ usedMb: 500 }), { usedMb: 500, totalMb: 5000 }, { now: NOW });
  const near = decideRefillAction(metered({ usedMb: 4400 }), { usedMb: 4400, totalMb: 5000 }, { now: NOW });
  assert.ok(near.nextPollSeconds < far.nextPollSeconds);
  assert.ok(near.nextPollSeconds >= 60);
});

test("adaptive poll: high burn rate forces a faster next poll", () => {
  // burned 2000MB in 10 min -> very fast; must poll well before ceiling
  const lc = metered({ usedMb: 3000 });
  const r = decideRefillAction(lc, { usedMb: 3000, totalMb: 5000 }, {
    now: NOW,
    prev: { usedMb: 1000, atMs: NOW - 10 * 60 * 1000 },
  });
  assert.ok(r.nextPollSeconds <= 600);
  assert.ok(r.nextPollSeconds >= 60);
});
