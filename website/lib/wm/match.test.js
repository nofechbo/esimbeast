import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMatcher } from "./match.js";

// minimal parsed-family fixtures (shape from parseCoverageFamily)
const fams = [
  { name: "Vietnam", countryCodes: ["VN"], isMulti: false },
  { name: "Singapore, Malaysia, Indonesia, Thailand, Vietnam", countryCodes: ["SG", "MY", "ID", "TH", "VN"], isMulti: true },
  { name: "Europe B", countryCodes: ["AT", "BE"], isMulti: true },
  { name: "Europe C", countryCodes: ["AL", "IE"], isMulti: true },
  { name: "Japan", countryCodes: ["JP"], isMulti: false },
  { name: "Japan softbank", countryCodes: ["JP"], isMulti: false },
];

test("Jaccard: a single-country product prefers the single-country family", () => {
  const match = buildMatcher(fams);
  const m = match({ productName: "Vietnam, 10 Days, 1GB /day", productRegion: "Vietnam" });
  assert.equal(m.family.name, "Vietnam"); // NOT the 5-country SEA family
});

test("variant letters must agree (Europe B != Europe C)", () => {
  const match = buildMatcher(fams);
  const m = match({ productName: "Europe B, 10 Days, 1GB /day", productRegion: "Europe" });
  assert.equal(m.family.name, "Europe B");
});

test("operator token disambiguates Japan Softbank from generic Japan", () => {
  const match = buildMatcher(fams);
  const m = match({ productName: "Japan Softbank, 10 Days, 1GB /day", productRegion: "Japan" });
  assert.equal(m.family.name, "Japan softbank");
});
