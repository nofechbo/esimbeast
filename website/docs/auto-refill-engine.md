# Managed eSIM auto-refill engine

Margin-engineering layer for EA-supplied products: sell a big allowance, provision
a small one, and grow it just-in-time as the customer consumes — so we pay for a
rolling reservoir that's smaller than the advertised allowance for the majority of
customers who never reach it.

## The core idea: entitlement ≠ physical eSIM

| | Entitlement | Physical eSIM |
|---|---|---|
| What | what the customer is **promised** ("10GB / 30d", "3-day unlimited") | what we actually order from EA (a cheap base SKU + top-ups) |
| Where | `EsimLifecycle` row | EA, keyed by `esimTranNo` / `iccid` |
| Who sees it | the customer | only us |

The customer always experiences their full entitlement. We provision the minimum
and refill ahead of consumption.

## Coverage mode (decided 2026-06-28)

EA gives an end-of-pack **gift** (+2GB on a 10GB pack, +5GB on a 20GB pack) that
lands at the **end** of the pack, not upfront. So we under-provision by the gift:

```
10GB entitlement, gift +2GB:
  managedCeilingMb = 10 - 2 = 8GB        (we cover this with base + paid top-ups)
  base 5GB  --(used nears 5)-->  top up +3GB  -->  8GB managed
  gift +2GB lands at the end  -->  10GB total
```

The gift is **never trusted for live coverage**. If a fast user approaches the
managed ceiling before we *observe* the gift land (EA's reported `totalData` jumps
above our `physicalCeilingMb`), the engine fires a **paid safety top-up** instead
of risking a coverage gap. Reliability beats the marginal saving on the rare heavy
user. (`safetyTopUpCount` tracks how often this happens.)

Unlimited products are the same machine with a fair-use cap: "3-day unlimited" =
provision a small base, grow in increments, hard-stop at **5GB** or **3 days**.

## Components

| File | Role |
|---|---|
| `prisma/schema.prisma` → `EsimLifecycle` | one row per managed physical eSIM |
| `lib/refill/constants.js` | states, actions, byte/MB helpers |
| `lib/refill/engine.js` | **pure** decision engine — `decideRefillAction()` |
| `lib/refill/engine.test.js` | 14 unit tests (`npm test`) |
| `lib/refill/ea.js` | EA `queryUsage()` + `topUp()` (MB-normalized) |
| `lib/refill/products.js` | managed-product templates → lifecycle builder |
| `scripts/refillManagedEsims.js` | the cron worker (run on an interval) |
| `scripts/smokeTestEARefill.js` | **the gate** — measures the EA unknowns |
| `scripts/listEATopUpSkus.js` | read-only: list top-up-able EA SKUs |

The engine is pure (no I/O); the worker does all EA calls and DB writes. Top-ups
use a deterministic idempotency key (`refill-<id>-<seq>`) and the physical-ceiling
increment is persisted **only after EA confirms** — a failed top-up never records
data we didn't get, and is retried next tick.

## Before this goes near a paying customer — the gate

Three EA behaviours are assumed but **unverified in our code**. Run the smoke test
against one existing top-up-able eSIM (applies exactly one paid top-up):

```bash
ESIMACCESS_ACCESS_CODE=… node scripts/smokeTestEARefill.js \
  --esimTranNo=… --iccid=… --topUpSku=… --live
```

It resolves:
1. **Key** — does `/esim/topup` accept `iccid` or `esimTranNo`? → set `EA_TOPUP_KEY_FIELD`.
2. **Apply latency** — how long until `totalData` rises → sizes `refillThresholdPct` + safety buffer.
3. **Idempotency** — does a replayed `transactionId` *not* double-add? → required before any auto-retry.

Gift **timing** (when the +2/+5 actually lands) can't be smoke-tested — observe it
on the first real managed orders.

## Wiring (still TODO, intentionally gated)

1. Run `npm run refill:list-skus` and fill the `*Sku` codes in `lib/refill/products.js`.
2. On EA fulfillment (`scripts/pollPendingEAOrders.js`, where `esimTranNo`/`iccid`
   become known), for a managed plan call `buildLifecycleInput(template, …)` and
   `prisma.esimLifecycle.create()`.
3. Schedule `npm run refill:run` on a short interval (e.g. every minute).

Steps 1–3 are deliberately **not** activated until the smoke test passes.

## Apply on staging (prod DB — never touch live first)

```bash
DATABASE_URL=<staging> npx prisma migrate deploy   # applies 20260628120000_add_esim_lifecycle
```
