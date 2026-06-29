import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCarrier, parseCoverageFamily, countryToIso } from "./coverage.js";

test("countryToIso resolves common + aliased names", () => {
  assert.equal(countryToIso("Austria"), "AT");
  assert.equal(countryToIso("Mainland China"), "CN");
  assert.equal(countryToIso("UK"), "GB");
  assert.equal(countryToIso("Macao"), "MO");
  assert.equal(countryToIso("Vietnam"), "VN");
});

test("parseCarrier extracts country + operators (full-width parens, / split)", () => {
  const r = parseCarrier("奧地利（Austria） A1 Telekom/Three");
  assert.equal(r.country, "Austria");
  assert.equal(r.countryCode, "AT");
  assert.deepEqual(r.operators, ["A1 Telekom", "Three"]);
});

test("parseCarrier single operator, half-width parens", () => {
  const r = parseCarrier("法國 (France) Orange");
  assert.equal(r.countryCode, "FR");
  assert.deepEqual(r.operators, ["Orange"]);
});

test("parseCoverageFamily builds structured multi-country coverage", () => {
  const fam = {
    plan: "【Worldmove】中港澳\nChina, Hong Kong, Macao",
    carriers: [
      "中國內地（Mainland China）China Unicom",
      "香港（Hong Kong）CSL",
      "澳門（Macao）CTM",
    ],
    network: ["4G", "5G/4G"],
    apn: ["mobile"],
    roaming: ["CSL"],
    notes: "",
    reset: "Data reset 00:00 Taiwan",
  };
  const c = parseCoverageFamily(fam);
  assert.equal(c.name, "China, Hong Kong, Macao");
  assert.deepEqual(c.countryCodes.sort(), ["CN", "HK", "MO"]);
  assert.equal(c.isMulti, true);
  assert.equal(c.network, "4G, 5G/4G");
  assert.equal(c.byCountry[0].operators[0], "China Unicom");
});
