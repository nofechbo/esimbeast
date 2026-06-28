// Thin EA (eSIMAccess) calls the refill engine needs: usage query + top-up.
// Order/query already live in pages/api/orderPlan/orderFunctions.js and
// scripts/pollPendingEAOrders.js; this module adds the two the auto-refill loop
// relies on and normalizes EA's bytes into the MB the engine speaks.

import { ESIMACCESS_ACCESS_CODE } from "../../config.js";
import { bytesToMb } from "./constants.js";

const BASE = "https://api.esimaccess.com/api/v1/open/esim";

async function eaPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
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
 * Latest usage for an eSIM, keyed by esimTranNo (same key the /plan-status page
 * uses). Returns MB so the engine never sees raw bytes.
 * @returns {{ usedMb:number, totalMb:number, lastUpdateTime:any, raw:object }|null}
 */
export async function queryUsage(esimTranNo) {
  const obj = await eaPost("/usage/query", { esimTranNoList: [esimTranNo] });
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
 * Add data to a live eSIM.
 *
 * IMPORTANT — two things are UNVERIFIED until the smoke test runs:
 *   1. the identifying key: the platform adapter sends `iccid`, but esimbeast
 *      tracks `esimTranNo`. We send whichever the caller provides; the smoke
 *      test resolves which EA actually accepts (set keyField accordingly).
 *   2. idempotency: EA is assumed to dedupe on transactionId so a retried
 *      top-up never double-charges. The smoke test must confirm this before the
 *      engine is allowed near a paying customer.
 *
 * @param {object} p { iccid?, esimTranNo?, packageCode, transactionId, keyField? }
 */
export async function topUp({ iccid, esimTranNo, packageCode, transactionId, keyField }) {
  const field = keyField ?? (iccid ? "iccid" : "esimTranNo");
  const idValue = field === "iccid" ? iccid : esimTranNo;
  if (!idValue) throw new Error(`topUp: missing ${field}`);
  if (!packageCode) throw new Error("topUp: missing packageCode");
  if (!transactionId) throw new Error("topUp: missing transactionId (idempotency key)");

  return eaPost("/topup", {
    [field]: idValue,
    packageCode,
    transactionId,
  });
}

/**
 * Deterministic idempotency key for a top-up so retries never double-add.
 * One key per (lifecycle, sequence). EA must honor it (see note above).
 */
export function topUpTxnId(lifecycleId, sequence) {
  return `refill-${lifecycleId}-${sequence}`;
}
