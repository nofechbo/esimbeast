# Full catalog import (EA + WM)

Brings the **entire** supplier catalog into the `Plan` table with notes, instead of
only the handful of hand-priced rows.

## What was wrong

The EA price mapping did `parseRequiredInt(row["Price in cents"])`, which **throws
on a blank cell** — and `transformCsvDataToPlan` catches the throw and silently
**skips the row**. Only ~22 of EA's 2,853 packages had that column filled, so the
other ~2,831 never reached the DB. (They weren't missing notes — they were dropped
whole.)

## The change

- **Resale price no longer gates the row.** A hand-set `Price in cents` still wins;
  otherwise we fall back to EA's own suggested `retailPrice` (a flat **2× cost**
  across the whole catalog), or 2× cost if retail is missing. See
  `eaResalePriceCents()` / `eaUnitsToCents()` in `scripts/utils/parsers.js`.
  → interim pricing; the **eSIMdb-undercut repricer is the next phase** and will own
  this value.
- **Cost normalized to cents.** EA cost was stored in EA's raw 1/10000-USD units;
  `supplierPrice` is now real cents, consistent with `price`.
- **Notes.** EA's catalog notes are thin (no `saleNote`; `description` is just the
  name), but the mapping already fills what EA provides — plan type, networks,
  speed, activation, FUP/reduced-speed — and now a synthesized `notification` from
  `ipExport` ("Connects via … IP") + an SMS-unsupported flag. `localNumber` / `eKYC`
  / `hotspot` stay null: EA exposes no per-package source for them. (WM notes come
  from the after-sales sheet and are unchanged.)
- **$0 safety gate.** `transformCsvDataToPlan` now skips any row with a non-positive
  price — killing the `$0`-plan bug class (e.g. the WM Thailand DTAC row). Coverage
  is already guaranteed (an empty country list throws → skip).
- **FUP typo tolerance.** Some EA `fupPolicy` values are malformed (`kpbs`); EA's
  reduced-speed parse now tolerates that (→ null) instead of dropping the plan. WM
  stays strict so sheet typos still surface.
- **Capped-first listings.** New `Plan.isCapped` (EA `dataType=1` / WM with no
  per-day cap). `getAllPlans`, `findPlansByFilters` and the chooser
  (`search/results`) sort capped-first then cheapest — the deprioritized daily-limit
  SKUs (1,281 of EA's 2,853) sink to the bottom, and the chooser only surfaces one
  when no capped plan fits. Capped plans are the strategic primitive (they back the
  auto-refill products).

## Result (verified via dry run)

`node scripts/previewEACatalog.js` (read-only, no DB/sheet writes) against the live
catalog: **2,853 / 2,853 EA packages import, 0 skipped**, price $0.60–$524 (avg
~$20), notes populated.

## Run it (staging first — prod DB)

```bash
node scripts/previewEACatalog.js            # dry run — confirm counts/prices first
node scripts/writeEsimAccessToSheet.js      # refresh the EA sheet from the API
DATABASE_URL=<staging> node scripts/syncPlans.js   # Sheet -> Plan (EA + WM)
```

## Caveats / next

- **All valid plans go live at once** (the storefront sells every `Plan` row). That's
  the chosen "validate + publish all" behaviour — there is no `published` flag on
  this branch.
- **Duplicate country/data combos**: with 2,853 EA SKUs live, the canonical-page
  dedup (`isPrimary` / `bucketKey`) lives on the `seo-clean-slugs-redirects` branch;
  reconcile the two for clean storefront display.
- **Channel split**: EA = main-page chooser, WM = SEO/LP pages — enforce as a
  `supplier` filter per surface when wiring the storefront.
- **Next phase**: the eSIMdb-undercut repricer (`priceFloorCents`, `pricePerGbCents`,
  a `CompetitorPrice` feed) replaces the 2× interim price.
```
