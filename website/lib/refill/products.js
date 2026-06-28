// Managed-product templates: the recipe that turns a customer ENTITLEMENT into a
// cheap physical provisioning plan for the auto-refill engine.
//
// One template per sellable managed product. The `*Sku` fields are EA package
// codes and MUST be filled from the live EA catalog — run
// `node scripts/listEATopUpSkus.js` to list top-up-able SKUs (supportTopUpType==2)
// and their sizes, then drop the codes in below. They're left null on purpose so
// nothing can silently provision against the wrong SKU.

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
    baseSku: null, // TODO: EA packageCode for the 5GB/30d base
    baseDataMb: gbToMb(5),
    topUpSku: null, // TODO: EA packageCode for the 3GB top-up
    refillIncrementMb: gbToMb(3),
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
    topUpSku: null, // top-up increment SKU
    refillIncrementMb: gbToMb(5),
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
    topUpSku: null, // 1GB top-up
    refillIncrementMb: gbToMb(1),
    refillThresholdPct: 75,
  },
};

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
 * @param {object} template a MANAGED_PRODUCTS entry
 * @param {object} order    { planOrderId, intentId, iccid?, esimTranNo?, supplier? }
 */
export function buildLifecycleInput(template, order) {
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
    topUpSku: template.topUpSku,
    physicalCeilingMb: template.baseDataMb,
    managedCeilingMb,
    refillThresholdPct: template.refillThresholdPct ?? 80,
    refillIncrementMb: template.refillIncrementMb,
    state: "provisioned",
  };
}
