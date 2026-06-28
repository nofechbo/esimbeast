# eSIMdb integration: referral attribution + coupons + affiliate tracking

Three pieces for partner/affiliate traffic (eSIMdb and others).

## 1. Referral attribution (`?ref=…`) — mostly pre-existing, now durable
- `?ref=esimdb` is captured into a 30-day `ref` cookie (`handleReferral`, on the
  homepage + plan pages) and survives the journey.
- At checkout it's now carried into the **Stripe PaymentIntent metadata** and
  written onto every **`PlanOrder`** (`ref`, `couponCode`, `discountCents`) — so
  each order is attributable in the DB, not only the referral Google Sheet.

## 2. Coupons (manual code entry)
- Customer types a code at checkout (`PaymentFlow` coupon field) → `POST
  /api/coupon/validate` previews the discount → on pay, the code is sent to
  `create-payment-intent`, which **re-evaluates and sets the charged amount
  server-side** (`lib/coupon.js`). The client can never dictate the price.
- `Coupon` model: `code` (unique, uppercased), `type` (`percent`|`fixed`),
  `value`, `active`, `expiresAt`, `maxRedemptions`/`redemptions`, `minAmountCents`,
  `note`. Redemptions increment once per paid order.
- Guards: caps discount at the subtotal (never negative), rejects misconfigured
  (>100%) codes, and refuses totals under Stripe's $0.50 minimum.
- **Create the eSIMdb coupon:**
  ```bash
  DATABASE_URL=… node scripts/upsertCoupon.js --code=ESIMDB10 --type=percent --value=10 --note="eSIMdb partner"
  # or a fixed amount: --type=fixed --value=300   (= $3.00 off)
  ```

## 3. Affiliate conversion tracking (server-side postback)
- On a paid order, `fireAffiliatePostback` (in `order-and-redeem`) fires a
  server-to-server postback — reliable, ad-blocker-proof, once per order.
- No-op unless `AFFILIATE_POSTBACK_URL` is set (in Render env) **and** the order
  has a `ref`. Set it to your dev/network's template with `{placeholders}`:
  ```
  AFFILIATE_POSTBACK_URL=https://track.partner.com/postback?ref={ref}&order={orderId}&amount={amount}&coupon={coupon}
  ```
  Placeholders: `{ref} {orderId} {amount}(dollars) {amountCents} {coupon} {email}`.
- If your dev's tracking is a **client-side pixel** instead, drop it on
  `pages/success.js` (the order-confirmed page) — the two can coexist.

## Schema / migration
`Coupon` table + `PlanOrder.ref/couponCode/discountCents` →
`20260629100000_add_coupons_attribution`. Apply on staging:
`npx prisma migrate deploy`.

## 4. eSIMdb price-war (EA channel)
The eSIMdb 50% coupon + a competitor-driven price let us undercut the cheapest
rival by 1¢ while the ×2 list price absorbs the coupon:
```
net  = max(competitor − 1¢, cost + min margin)   # floored — never below cost
list = net × 2                                    # Plan.price; 50% coupon → net
```
- `lib/esimdb/reprice.js` — the formula (+ `ESIMDB_MIN_MARGIN_PCT`, default 15%).
- `CompetitorPrice` table — cheapest esimdb.com price per EA plan (populated by the
  scraper, below).
- `scripts/esimdb/reprice.js` — sets `Plan.price` for EA plans from CompetitorPrice
  (`--dry` to preview).
- **Coupon scope** — `Coupon.supplierScope` restricts the 50% code to EA plans, so
  it can never halve a normal `cost × 2` plan down to cost. Create it:
  ```bash
  node scripts/upsertCoupon.js --code=ESIMDB --type=percent --value=50 --supplier=EA --note="eSIMdb partner"
  ```
- ⚠️ **Floor guard:** on plans where a competitor is below our cost, the repricer
  holds `cost + margin` instead of undercutting (we don't sell at a loss).

## Still needed / next
- The eSIMdb **coupon code string** (discount is 50%, EA-scoped — confirmed).
- Your dev's **affiliate tracking** method (S2S postback URL? or a client pixel?).
- **The scraper** — read each EA plan's cheapest competitor price off esimdb.com
  into `CompetitorPrice` (the repricer's input). Not built yet; needs esimdb.com
  page-structure inspection + plan matching.
