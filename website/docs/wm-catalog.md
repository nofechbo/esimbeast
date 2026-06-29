# WM (Worldmove) full-catalog import + structured per-country coverage

Imports the entire WM eSIM catalog into `Plan`, each plan enriched with **per-country
coverage** ("suppliers for multi") — for a regional plan, which operator(s) serve
each country, plus APN / network / roaming / notes / phone flag.

WM is the **programmatic-SEO channel**, so we import the full catalog (stuffing), vs
EA's price-war channel.

## Data sources (`data/wm/`)
- **`wm-catalog.json`** — 7,212 WM eSIM products from the WM API `/Api/QuoteMg/myQueryAll`
  (fastmove.com.tw). Lean fixture: `wmproductId, productId, productName, productRegion,
  productPrice`. ⚠️ The live endpoint IP-blocks on frequent calls — fetched once, cached.
- **`wm-coverage.json`** — 109 after-sales coverage families (per-country carriers, APN,
  network, roaming, notes, reset). This is reference data, not a live API.

## Pipeline (`lib/wm/`)
| File | Role |
|---|---|
| `coverage.js` | `parseCoverageFamily` → structured per-country `{byCountry:[{country,countryCode,operators}], network, apn, roaming, notes, reset, hasPhone}`. 95% of operators resolve to ISO. |
| `match.js` | `buildMatcher` joins each product to a coverage family (Jaccard set-similarity, variant-letter + operator disambiguation). 93% matched. |
| `build.js` | `parseProductName` + `priceCents` + `buildWmPlan` → a `Plan` row. |

**Pricing:** WM's `productcPrice` (cost) is 0 for all; `productPrice` is our **wholesale
cost in TWD**. So `cost = productPrice × WM_TWD_USD` (default 0.031) and
`retail = cost × WM_MARKUP` (default 2). Both env-overridable.

**Coverage fallback:** unmatched products (492 of 493 are single-country "Singapore")
fall back to the name-prefix country via `countryToIso`. Products with no resolvable
country are dropped.

## Schema
`Plan.coverage Json?` (the structured per-country object) + `Plan.hasPhone Boolean`.
Migration `20260628140000_add_wm_coverage`.

## Dry run (no DB, verified)
```bash
node scripts/wm/previewWMImport.js
# 7,015 built / 7,212 · 197 dropped · 93% with coverage · 0 dup slugs
# retail min $0.86 · p50 $17.30 · p90 $71.24 · max $519.80
```
Re-price without code changes: `WM_TWD_USD=0.03 WM_MARKUP=2.5 node scripts/wm/previewWMImport.js`.

## Run the import (STAGING first — prod DB)
```bash
DATABASE_URL=<staging> npx prisma migrate deploy           # adds coverage + hasPhone
DATABASE_URL=<staging> node scripts/wm/importWMCatalog.js  # upsert + prune WM plans
```

## Notes / next
- **Capped-first** still applies: daily WM plans get `isCapped=false`, total-data `true`.
- The **live catalog refresh** (re-fetch `/Api/QuoteMg/myQueryAll` with WM creds + the
  query signature) is a separate, unverified path — the committed fixture is the
  reproducible source for now.
- Storefront can now show per-country operators (`plan.coverage.byCountry`) and a
  "calls included" badge (`plan.hasPhone`).
