// Affiliate conversion tracking. Server-to-server (S2S) postback is the reliable
// method (not blocked by ad-blockers, fires once per paid order). The exact URL
// comes from your affiliate network / dev — set it as AFFILIATE_POSTBACK_URL with
// {placeholders}, e.g.:
//   https://track.partner.com/postback?ref={ref}&order={orderId}&amount={amount}&email={email}
//
// If your dev's tracking is instead a CLIENT-side pixel/script, drop it on the
// success page (pages/success.js) — this S2S hook and that pixel can coexist.

/** Fill a postback template's {placeholders} with URL-encoded values. */
export function buildPostback(template, vars) {
  if (!template) return null;
  return template.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(vars[k] ?? ""));
}

/**
 * Fire the affiliate conversion postback (best-effort, never throws/blocks).
 * No-op unless AFFILIATE_POSTBACK_URL is set and the order has a ref.
 * @param {{ ref?:string, orderId:string, amountCents:number, couponCode?:string, email?:string }} order
 */
export async function fireAffiliatePostback(order) {
  const template = process.env.AFFILIATE_POSTBACK_URL;
  if (!template || !order?.ref) return;
  const url = buildPostback(template, {
    ref: order.ref,
    orderId: order.orderId,
    amount: (order.amountCents ?? 0) / 100, // dollars
    amountCents: order.amountCents ?? 0,
    coupon: order.couponCode ?? "",
    email: order.email ?? "",
  });
  try {
    await fetch(url, { method: "GET" });
    console.log(`[affiliate] postback fired ref=${order.ref} order=${order.orderId}`);
  } catch (e) {
    console.warn(`[affiliate] postback failed: ${e.message}`);
  }
}
