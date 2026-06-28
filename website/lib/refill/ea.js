// The EA (eSIMAccess) calls the refill engine needs: usage query, the per-eSIM
// top-up catalog, and the top-up itself. Order/query already live in
// pages/api/orderPlan/orderFunctions.js and scripts/pollPendingEAOrders.js.
//
// Verified against the live API 2026-06-28 (smoke test on a Turkey CKH025 eSIM):
//   - usage/query keys on esimTranNo (NOT iccid — the iccid form returns 000105)
//   - top-up keys on ICCID
//   - top-up codes are a SEPARATE, TOPUP_-prefixed catalog, queried per-eSIM via
//     package/list {iccid, type:"TOPUP"}; a base packageCode is rejected (310242)
//   - apply latency ~16s; same transactionId is idempotent (no double-add)

import { ESIMACCESS_ACCESS_CODE } from "../../config.js";
import { bytesToMb } from "./constants.js";

const OPEN = "https://api.esimaccess.com/api/v1/open";

async function eaPost(path, body) {
  const res = await fetch(`${OPEN}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": ESIMACCESS_ACCESS_CODE,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`EA ${path} HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.success !== true) {
    throw new Error(
      `EA ${path} rejected: ${json.errorCode || "unknown"} ${json.errorMsg || ""}`.trim(),
    );
  }
  return json.obj;
}

/**
 * Latest usage for an eSIM, keyed by esimTranNo. Returns MB so the engine never
 * sees raw bytes.
 * @returns {{ usedMb:number, totalMb:number, lastUpdateTime:any, raw:object }|null}
 */
export async function queryUsage(esimTranNo) {
  const obj = await eaPost("/esim/usage/query", { esimTranNoList: [esimTranNo] });
  const usage = obj?.esimUsageList?.[0];
  if (!usage) return null;
  return {
    usedMb: bytesToMb(usage.dataUsage),
    totalMb: bytesToMb(usage.totalData),
    lastUpdateTime: usage.lastUpdateTime ?? null,
    raw: usage,
  };
}

/**
 * Top-up packages VALID for a specific eSIM (the TOPUP_-prefixed catalog). EA
 * scopes these to the eSIM's region/operator, so this must be queried per-eSIM —
 * there is no global top-up list and a base packageCode is not a top-up code.
 * @returns {Array<{packageCode,volumeMb,days,priceUsd,name,raw}>}
 */
export async function listTopUpPackages({ iccid, packageCode }) {
  if (!iccid && !packageCode) throw new Error("listTopUpPackages: need iccid or packageCode");
  const obj = await eaPost("/package/list", {
    ...(iccid ? { iccid } : { packageCode }),
    type: "TOPUP",
  });
  return (obj?.packageList || []).map((p) => ({
    packageCode: p.packageCode,
    volumeMb: bytesToMb(p.volume),
    days: p.duration,
    priceUsd: p.price != null ? p.price / 10000 : null, // EA price = 1/10000 USD
    name: p.name,
    raw: p,
  }));
}

/**
 * Add data to a live eSIM. Keyed on ICCID (verified). `packageCode` must be a
 * TOPUP_ code from listTopUpPackages() for THIS eSIM. `transactionId` is the
 * idempotency key — EA dedupes on it, so a retry never double-adds (verified).
 *
 * @param {object} p { iccid, packageCode, transactionId, esimTranNo?, keyField? }
 */
export async function topUp({ iccid, esimTranNo, packageCode, transactionId, keyField }) {
  const field = keyField ?? "iccid"; // EA tops up by iccid
  const idValue = field === "iccid" ? iccid : esimTranNo;
  if (!idValue) throw new Error(`topUp: missing ${field}`);
  if (!packageCode) throw new Error("topUp: missing packageCode (TOPUP_ code)");
  if (!transactionId) throw new Error("topUp: missing transactionId (idempotency key)");

  return eaPost("/esim/topup", {
    [field]: idValue,
    packageCode,
    transactionId,
  });
}

/**
 * Deterministic idempotency key for a top-up so retries never double-add.
 * One key per (lifecycle, sequence). EA honors it (verified 2026-06-28).
 */
export function topUpTxnId(lifecycleId, sequence) {
  return `refill-${lifecycleId}-${sequence}`;
}
