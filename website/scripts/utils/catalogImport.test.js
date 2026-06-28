import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eaResalePriceCents,
  eaUnitsToCents,
  eaNotification,
} from "./parsers.js";
import { supplierToDBFuncMap } from "./mapping.js";
import { transformCsvDataToPlan } from "./syncPlansUtils.js";

// A sheet-shaped EA row (API fields flattened to strings + the manual price col).
function eaRow(overrides = {}) {
  return {
    packageCode: "CKH025",
    slug: "TR_3_30",
    name: "Turkey 3GB 30Days",
    duration: "30",
    volume: "3221225472", // 3 GB
    price: "14200", // cost, 1/10000 USD = $1.42
    retailPrice: "28400", // EA suggested = 2x cost
    supportTopUpType: "2",
    resolvedCountryCodes: "TR",
    fupPolicy: "",
    speed: "3G/4G/5G",
    locationNetworkList: "Türk Telekom 5G",
    activeType: "2",
    dataType: "1",
    smsStatus: "2",
    description: "Turkey 3GB 30Days",
    ipExport: "Europe",
    "Price in cents": "",
    ...overrides,
  };
}

test("eaUnitsToCents: 1/10000 USD -> cents", () => {
  assert.equal(eaUnitsToCents("14200"), 142);
  assert.throws(() => eaUnitsToCents(""));
});

test("eaResalePriceCents: hand price wins", () => {
  assert.equal(eaResalePriceCents(eaRow({ "Price in cents": "999" })), 999);
});

test("eaResalePriceCents: falls back to retailPrice (2x) when blank", () => {
  assert.equal(eaResalePriceCents(eaRow()), 284); // 28400 / 100
});

test("eaResalePriceCents: falls back to 2x cost when no retail", () => {
  assert.equal(eaResalePriceCents(eaRow({ retailPrice: "0" })), 284); // 14200*2/100
});

test("eaResalePriceCents: throws when no price and no cost", () => {
  assert.throws(() => eaResalePriceCents(eaRow({ "Price in cents": "", retailPrice: "0", price: "0" })));
});

test("eaNotification: synthesizes IP-exit note; flags no-SMS", () => {
  assert.equal(eaNotification(eaRow()), "Connects via Europe IP");
  assert.equal(
    eaNotification(eaRow({ smsStatus: "0" })),
    "Connects via Europe IP. SMS not supported",
  );
  assert.equal(eaNotification(eaRow({ ipExport: "", smsStatus: "2" })), null);
});

test("EA mapping: full row maps with 2x price, cost in cents, notes", () => {
  const EA = supplierToDBFuncMap.EA;
  const row = eaRow();
  assert.equal(EA.price(row), 284);
  assert.equal(EA.supplierPrice(row), 142);
  assert.equal(EA.reloadable(row), true);
  assert.deepEqual(EA.countryCodes(row), ["TR"]);
  assert.deepEqual(EA.networks(row), ["Türk Telekom 5G"]);
  assert.equal(EA.notification(row), "Connects via Europe IP");
  assert.equal(Number(EA.data(row)), 3);
});

test("transformCsvDataToPlan: EA row with blank price now imports (was dropped)", () => {
  const plan = transformCsvDataToPlan(eaRow(), "EA");
  assert.ok(plan, "plan should not be skipped");
  assert.equal(plan.price, 284);
  assert.equal(plan.supplier, "EA");
});

// A sheet-shaped WM row (minimal valid).
function wmRow(overrides = {}) {
  return {
    wmproductId: "WM1",
    Code: "C1",
    "plan name": "Thailand",
    Days: "30",
    GB: "5",
    "GB per day": "",
    "reduced speed": "",
    "Sell Price": "999",
    Reloadable: "no",
    "Country code": "TH",
    Networks: "DTAC",
    "Network Speed": "",
    APN: "",
    Hotspot: "",
    Activation: "",
    Delivery: "",
    "Your Plan Summary": "",
    "Plan Type": "",
    "Local Number": "",
    notification: "",
    ...overrides,
  };
}

test("transformCsvDataToPlan: $0 WM plan is skipped (the Thailand bug class)", () => {
  assert.equal(transformCsvDataToPlan(wmRow({ "Sell Price": "0" }), "WM"), undefined);
  assert.ok(transformCsvDataToPlan(wmRow(), "WM"), "valid-priced WM plan imports");
});
