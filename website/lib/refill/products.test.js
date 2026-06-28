import { test } from "node:test";
import assert from "node:assert/strict";
import { isRefillablePackage, pickBasePackage } from "./products.js";

// raw EA /package/list shapes
const capped5 = { packageCode: "CKHcap5", dataType: 1, supportTopUpType: 2, volume: 5_000_000_000, duration: 30 };
const capped3 = { packageCode: "CKHcap3", dataType: 1, supportTopUpType: 2, volume: 3_000_000_000, duration: 30 };
const capped10 = { packageCode: "CKHcap10", dataType: 1, supportTopUpType: 2, volume: 10_000_000_000, duration: 30 };
const dailyLimit = { packageCode: "CKHdaily", dataType: 2, supportTopUpType: 2, volume: 5_000_000_000, duration: 30 };
const cappedNoTopup = { packageCode: "CKHnt", dataType: 1, supportTopUpType: 1, volume: 5_000_000_000, duration: 30 };

test("isRefillablePackage: only capped (total-data) + top-up-able qualifies", () => {
  assert.equal(isRefillablePackage(capped5), true);
  assert.equal(isRefillablePackage(dailyLimit), false); // daily-limit: resets daily
  assert.equal(isRefillablePackage(cappedNoTopup), false); // not top-up-able
});

test("pickBasePackage: smallest capped+reloadable >= desired; excludes daily-limit", () => {
  const pick = pickBasePackage([dailyLimit, capped10, capped3, capped5], 5000);
  assert.equal(pick.packageCode, "CKHcap5"); // 3GB too small, 5GB is smallest that fits
  assert.equal(pick.volumeMb, 5000);
});

test("pickBasePackage: never returns a daily-limit package even if it's the only match", () => {
  assert.equal(pickBasePackage([dailyLimit], 5000), null);
});

test("pickBasePackage: falls back to largest usable when none reach desired", () => {
  const pick = pickBasePackage([capped3, capped5], 20000);
  assert.equal(pick.packageCode, "CKHcap5");
});
