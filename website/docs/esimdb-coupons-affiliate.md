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

## Still needed from you
- The eSIMdb **coupon details** (code, percent vs fixed, amount, any expiry/limit).
- Your dev's **affiliate tracking** method (S2S postback URL? or a client pixel?) —
  so the hook matches exactly.
