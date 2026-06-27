# Clean slugs + redirects (programmatic SEO)

Replaces the old `/plans/<supplier>-<productId>-<name>-<days>-<data>` URLs (which
leaked supplier IDs, duplicated info, and changed whenever a plan name changed)
with stable, keyword-first URLs and a 301 safety net.

## URL scheme
```
/esim/{country}            country hub   →  /esim/france
/esim/{country}/{data}-{duration}  variant  →  /esim/france/10gb-30-days
```
- `country` comes from a stable ISO→slug map (`lib/slug.js`), never the supplier name.
- Regional plans collapse to a region slug: `europe`, `asia`, `southeast-asia`,
  `gulf`, `north-america`, `south-america`, `africa`, `global`.
- `data`: `10gb` · `500mb` · `unlimited` · daily plans `1gb-day` / `500mb-day`.

## One canonical page per bucket
`bucketKey = country|data|days`. Every plan gets a bucketKey; the **cheapest**
plan in a bucket is `isPrimary` and owns the clean `slug`. Non-primary SKUs have
`slug = null` (they're alternatives on the primary's page, not duplicate URLs).
The slug value is derived from the bucket, so it's stable even if the primary SKU
changes underneath it.

## Stability
- Plans upsert by `(supplier, productId)` — a name edit updates the same row
  instead of creating a new one (no URL churn).
- `reconcileSlugsAndPrimaries()` runs after every `syncPlans` and assigns
  primaries/slugs + refreshes redirects.

## Redirects
`Redirect` table (`fromPath` → `toPath`, 301). Cases:
1. **Migration:** old `/plans/<uniqueName>` → the bucket's canonical.
2. **Discontinued:** when a plan drops out, point its URL at the country hub
   (write a `Redirect` row) instead of serving a 404.
`middleware.js` reads `lib/redirects.generated.json` (a build-time snapshot from
`scripts/exportRedirects.js`) and 301s at the edge — no DB call on the hot path.

## Rollout (staging first — this is the live prod DB)
```
# 1. add columns + Redirect table
npx prisma migrate dev --name clean_slugs_redirects     # staging
# 2. backfill slugs/primaries/redirects for existing rows
DATABASE_URL=... node scripts/backfillSlugs.js
# 3. snapshot redirects for the edge middleware
DATABASE_URL=... node scripts/exportRedirects.js
# 4. deploy; submit the new sitemap in Search Console; watch 301 hits
```
`prebuild` should run `exportRedirects.js` so the middleware map ships fresh.
