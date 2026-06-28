import { test } from "node:test";
import assert from "node:assert/strict";
import { isEsimdbProduct } from "./eligible.js";

const ea = (data, days) => ({ supplier: "EA", data, days });

test("eSIMdb-eligible = EA 10/20GB ≤30 days only", () => {
  assert.equal(isEsimdbProduct(ea(10, 30)), true);
  assert.equal(isEsimdbProduct(ea(20, 7)), true);
  assert.equal(isEsimdbProduct(ea(10, 31)), false); // over 30 days
  assert.equal(isEsimdbProduct(ea(5, 30)), false); // wrong size
  assert.equal(isEsimdbProduct(ea(15, 30)), false); // wrong size
  assert.equal(isEsimdbProduct({ supplier: "WM", data: 10, days: 30 }), false); // not EA
  assert.equal(isEsimdbProduct(null), false);
});
