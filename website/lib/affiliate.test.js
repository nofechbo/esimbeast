import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPostback } from "./affiliate.js";

test("buildPostback fills + URL-encodes placeholders", () => {
  const url = buildPostback(
    "https://t.x/p?ref={ref}&o={orderId}&a={amount}&c={coupon}",
    { ref: "esimdb", orderId: "pi_123", amount: 17.3, coupon: "ESIMDB10" },
  );
  assert.equal(url, "https://t.x/p?ref=esimdb&o=pi_123&a=17.3&c=ESIMDB10");
});

test("buildPostback encodes special chars and blanks missing vars", () => {
  const url = buildPostback("https://t.x/p?e={email}&m={missing}", { email: "a b@x.com" });
  assert.equal(url, "https://t.x/p?e=a%20b%40x.com&m=");
});

test("buildPostback returns null for no template", () => {
  assert.equal(buildPostback("", {}), null);
});
