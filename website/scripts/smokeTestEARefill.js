/**
 * EA top-up smoke test — THE GATE for the auto-refill engine.
 *
 * The whole refill system assumes three things about EA that are currently
 * UNVERIFIED in our code. This script measures them against a real eSIM so the
 * reliability buffer is grounded in numbers, not guesses:
 *
 *   1. KEY — does /esim/topup accept `iccid` or `esimTranNo`? (Our usage query
 *      keys on esimTranNo; the platform adapter tops up by iccid.)
 *   2. LATENCY — how long after a top-up call does EA's reported totalData rise?
 *      This sets how early the engine must trigger (refillThresholdPct) and how
 *      big the safety buffer must be.
 *   3. IDEMPOTENCY — does re-sending the same transactionId NOT add data twice?
 *      The engine's retry safety depends on this.
 *
 * It runs against an EXISTING top-up-able eSIM (no new order placed) and applies
 * exactly ONE paid top-up, so the spend is one increment. It will NOT touch EA
 * without the explicit --live flag.
 *
 * Usage:
 *   ESIMACCESS_ACCESS_CODE=... \
 *   node scripts/smokeTestEARefill.js \
 *     --esimTranNo=XXXX --iccid=YYYY --topUpSku=ZZZZ [--key=iccid|esimTranNo] --live
 *
 * Note: gift TIMING (when EA's +2/+5 end-of-pack gift actually lands) can't be
 * measured here — it needs a real consumption run. Observe that in the field on
 * the first managed orders; this script proves the top-up mechanics underneath.
 */

import { ESIMACCESS_ACCESS_CODE } from "../config.js";

const BASE = "https://api.esimaccess.com/api/v1/open/esim";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const LIVE = args.live === true;
const ESIMTRANNO = args.esimTranNo;
const ICCID = args.iccid;
const TOPUP_SKU = args.topUpSku;
const KEY = args.key; // optional override; otherwise we try iccid then esimTranNo
const POLL_SECONDS = Number(args.pollSeconds || 15);
const TIMEOUT_SECONDS = Number(args.timeoutSeconds || 600);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function eaPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "RT-AccessCode": ESIMACCESS_ACCESS_CODE },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function getTotalBytes(esimTranNo) {
  const { json } = await eaPost("/usage/query", { esimTranNoList: [esimTranNo] });
  const u = json?.obj?.esimUsageList?.[0];
  return u ? { total: u.totalData ?? 0, used: u.dataUsage ?? 0, raw: u } : null;
}

async function tryTopUp(keyField, txnId) {
  const idValue = keyField === "iccid" ? ICCID : ESIMTRANNO;
  console.log(`  -> topup attempt key=${keyField} value=${idValue} txn=${txnId}`);
  const { ok, status, json } = await eaPost("/topup", {
    [keyField]: idValue,
    packageCode: TOPUP_SKU,
    transactionId: txnId,
  });
  return { ok: ok && json.success === true, status, json };
}

async function waitForIncrease(esimTranNo, baseline, label) {
  const start = Date.now();
  const deadline = start + TIMEOUT_SECONDS * 1000;
  while (Date.now() < deadline) {
    await sleep(POLL_SECONDS * 1000);
    const u = await getTotalBytes(esimTranNo);
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${label}] +${elapsed}s total=${u?.total} (baseline ${baseline})`);
    if (u && u.total > baseline) {
      return { latencySeconds: elapsed, newTotal: u.total };
    }
  }
  return { latencySeconds: null, newTotal: baseline };
}

async function main() {
  console.log("=== EA top-up smoke test ===\n");

  const missing = [];
  if (!ESIMACCESS_ACCESS_CODE) missing.push("ESIMACCESS_ACCESS_CODE (env)");
  if (!ESIMTRANNO) missing.push("--esimTranNo");
  if (!TOPUP_SKU) missing.push("--topUpSku");
  if (missing.length) {
    console.error("Missing required inputs:\n  - " + missing.join("\n  - "));
    process.exit(2);
  }

  console.log("Plan:");
  console.log(`  esimTranNo : ${ESIMTRANNO}`);
  console.log(`  iccid      : ${ICCID || "(not provided)"}`);
  console.log(`  topUpSku   : ${TOPUP_SKU}`);
  console.log(`  key order  : ${KEY ? [KEY] : [ICCID ? "iccid" : null, "esimTranNo"].filter(Boolean).join(" -> ")}`);
  console.log(`  poll       : every ${POLL_SECONDS}s, up to ${TIMEOUT_SECONDS}s`);

  if (!LIVE) {
    console.log("\nDRY RUN — re-run with --live to actually place ONE paid top-up against EA.");
    return;
  }

  // 1) baseline
  const baseline = await getTotalBytes(ESIMTRANNO);
  if (!baseline) {
    console.error("No usage row for that esimTranNo — is it installed/active?");
    process.exit(2);
  }
  console.log(`\nBaseline totalData = ${baseline.total} bytes (used ${baseline.used}).`);

  // 2) top-up — resolve which key EA accepts
  const txnId = `smoke-${Date.now()}`;
  const keyOrder = KEY ? [KEY] : [...(ICCID ? ["iccid"] : []), "esimTranNo"];
  let acceptedKey = null;
  let lastResp = null;
  for (const keyField of keyOrder) {
    const r = await tryTopUp(keyField, txnId);
    lastResp = r;
    if (r.ok) { acceptedKey = keyField; break; }
    console.log(`     rejected (status ${r.status}): ${JSON.stringify(r.json)}`);
  }
  if (!acceptedKey) {
    console.error("\nRESULT: top-up REJECTED on all keys. Engine cannot rely on /esim/topup.");
    console.error(JSON.stringify(lastResp?.json, null, 2));
    process.exit(1);
  }
  console.log(`\nTop-up accepted with key="${acceptedKey}". Measuring apply latency...`);

  // 3) latency to data increase
  const first = await waitForIncrease(ESIMTRANNO, baseline.total, "apply");
  if (first.latencySeconds == null) {
    console.error(`\nRESULT: top-up accepted but totalData never rose within ${TIMEOUT_SECONDS}s. Investigate before relying on this.`);
    process.exit(1);
  }

  // 4) idempotency — same txnId must NOT add data again
  console.log(`\nRe-sending the SAME transactionId to test idempotency...`);
  const replay = await tryTopUp(acceptedKey, txnId);
  console.log(`  replay accepted=${replay.ok} status=${replay.status}`);
  const afterReplay = await waitForIncrease(ESIMTRANNO, first.newTotal, "idempotency");
  const idempotent = afterReplay.latencySeconds == null; // no further increase = good

  // 5) report
  console.log("\n========== SMOKE TEST REPORT ==========");
  console.log(`accepted top-up key   : ${acceptedKey}`);
  console.log(`apply latency         : ~${first.latencySeconds}s (poll granularity ${POLL_SECONDS}s)`);
  console.log(`data added            : ${first.newTotal - baseline.total} bytes`);
  console.log(`idempotent on replay  : ${idempotent ? "YES ✅" : "NO ❌ — DANGER: retries double-add"}`);
  console.log("=======================================");
  console.log("\nFeed apply-latency into refillThresholdPct / safety buffer sizing.");
  if (!idempotent) {
    console.error("Idempotency FAILED — the engine must not auto-retry top-ups until this is solved.");
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
