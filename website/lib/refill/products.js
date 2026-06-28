// Managed-product templates: the recipe that turns a customer ENTITLEMENT into a
// cheap physical provisioning plan for the auto-refill engine.
//
// One template per sellable managed product. `baseSku` is the EA BASE packageCode
// we order to provision the eSIM — fill it from the catalog (it's null on purpose
// so nothing provisions against the wrong SKU).
//
// Top-up SKUs are NOT hardcoded here: EA's top-up codes are a TOPUP_-prefixed
// catalog scoped to each eSIM's region (verified 2026-06-28). The actual top-up
// code is resolved per-eSIM at lifecycle creation via listTopUpPackages(iccid) +
// pickTopUpPackage() below — so a Turkey eSIM gets a Turkey top-up, etc. The
// template only declares the DESIRED increment size; the resolver matches it to a
// real TOPUP_ package and the lifecycle records that package's true volume.

import { ENTITLEMENT_TYPE, gbToMb } from "./constants.js";

/** @typedef {keyof typeof MANAGED_PRODUCTS} ManagedProductKey */

export const MANAGED_PRODUCTS = {
  // "10GB / 30 days", fulfilled as 5GB base + paid top-ups to an 8GB managed
  // ceiling; EA's +2GB end-of-pack gift completes the 10GB.
  "metered-10gb-30d": {
    entitlementType: ENTITLEMENT_TYPE.METERED,
    promisedDataMb: gbToMb(10),
    windowDays: 30,
    giftMb: gbToMb(2),
    baseSku: null, // TODO: EA BASE packageCode for the 5GB/30d base
    baseDataMb: gbToMb(5),
    desiredIncrementMb: gbToMb(3), // resolver matches to a real TOPUP_ package
    refillThresholdPct: 80,
  },

  // "20GB / 30 days", 5GB base, grown to a 15GB managed ceiling; +5GB gift -> 20GB.
  "metered-20gb-30d": {
    entitlementType: ENTITLEMENT_TYPE.METERED,
    promisedDataMb: gbToMb(20),
    windowDays: 30,
    giftMb: gbToMb(5),
    baseSku: null,
    baseDataMb: gbToMb(5),
    desiredIncrementMb: gbToMb(5),
    refillThresholdPct: 80,
  },

  // "3-day unlimited", fair-use capped at 5GB. Provision a small base and grow it
  // in increments — a customer who uses <base never costs us more than the base.
  // No pack gift here, so managed ceiling == fair-use cap.
  "unlimited-3d": {
    entitlementType: ENTITLEMENT_TYPE.UNLIMITED,
    fairUseCapMb: gbToMb(5),
    windowDays: 3,
    giftMb: 0,
    baseSku: null, // TODO: small base, e.g. 1GB/30d
    baseDataMb: gbToMb(1),
    desiredIncrementMb: gbToMb(1),
    refillThresholdPct: 75,
  },
};

/**
 * Pick the best real TOPUP_ package for a desired increment from an eSIM's
 * top-up catalog (listTopUpPackages output). Prefer the smallest package that
 * is >= the desired increment (so we never under-cover a refill); fall back to
 * the largest available if none reach it. Returns null on an empty catalog.
 */
export function pickTopUpPackage(topUpList, desiredMb) {
  if (!topUpList || topUpList.length === 0) return null;
  const sorted = [...topUpList].sort((a, b) => a.volumeMb - b.volumeMb);
  return sorted.find((p) => p.volumeMb >= desiredMb) ?? sorted[sorted.length - 1];
}

/** Entitlement consumption ceiling for a template, in MB. */
export function templateCapMb(t) {
  return t.entitlementType === ENTITLEMENT_TYPE.UNLIMITED
    ? t.fairUseCapMb
    : t.promisedDataMb;
}

/**
 * Build the EsimLifecycle row for a freshly-fulfilled managed order.
 * Coverage mode: managedCeilingMb = entitlement cap - gift (we cover up to the
 * managed ceiling with paid data; the gift fills the rest).
 *
 * `topUpPkg` is the resolved TOPUP_ package for THIS eSIM (from pickTopUpPackage
 * over listTopUpPackages(iccid)). Its real volume becomes refillIncrementMb so
 * the engine reasons in the true top-up granularity EA actually sells.
 *
 * @param {object} template a MANAGED_PRODUCTS entry
 * @param {object} order    { planOrderId, intentId, iccid?, esimTranNo?, supplier? }
 * @param {object} topUpPkg { packageCode, volumeMb } resolved per-eSIM
 */
export function buildLifecycleInput(template, order, topUpPkg) {
  const cap = templateCapMb(template);
  const managedCeilingMb = Math.max(template.baseDataMb, cap - (template.giftMb ?? 0));
  return {
    planOrderId: order.planOrderId,
    intentId: order.intentId,
    supplier: order.supplier ?? "EA",
    entitlementType: template.entitlementType,
    promisedDataMb: template.promisedDataMb ?? null,
    fairUseCapMb: template.fairUseCapMb ?? null,
    windowDays: template.windowDays,
    giftMb: template.giftMb ?? 0,
    iccid: order.iccid ?? null,
    esimTranNo: order.esimTranNo ?? null,
    baseSku: template.baseSku,
    topUpSku: topUpPkg?.packageCode ?? null,
    physicalCeilingMb: template.baseDataMb,
    managedCeilingMb,
    refillThresholdPct: template.refillThresholdPct ?? 80,
    refillIncrementMb: topUpPkg?.volumeMb ?? template.desiredIncrementMb,
    state: "provisioned",
  };
}
