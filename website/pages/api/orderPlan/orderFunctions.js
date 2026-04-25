
import {
  WM_DEPT_ID,
  WM_MERCHANT_ID,
  WM_ORDER_AND_REDEEM_URL,
  WM_TOKEN,
} from "@/config";
import { generateEncStr } from "@/utils/generateEncStr";
import { WorldmoveApiError, WorldmoveRejectionError } from "./orderUtils";

export const orderWMPlan = async (intentId, email, plan, qty) => {
  const WM_URL = WM_ORDER_AND_REDEEM_URL;
  const merchantId = WM_MERCHANT_ID;
  const deptId = WM_DEPT_ID;
  const token = WM_TOKEN;
  const qrcodeType = 2;

  const prodList = [
    {
      wmproductId: plan.productId,
      qty,
    },
  ];

  /** @type {any} */
  let json;

  const encStr = generateEncStr(
    { merchantId, deptId, qrcodeType, prodList },
    token,
  );

  const requestBody = {
    merchantId,
    deptId,
    qrcodeType,
    prodList,
    encStr,
  };

  console.log("Worldmove order-and-redeem request:", {
    intentId,
    email,
    planName: plan.name,
    productId: plan.productId,
    qty,
  });

  const wmRes = await fetch(WM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!wmRes.ok) {
    console.error("Worldmove HTTP error", {
      intentId,
      email,
      httpStatus: wmRes.status,
      productId: plan.productId,
      qty,
    });
    const errorBody = await wmRes.json();
    throw new WorldmoveApiError(wmRes.status, errorBody);
  }

  json = await wmRes.json();
  if (json.code !== 0) {
    console.error("Worldmove rejected order-and-redeem", {
      intentId,
      email,
      productId: plan.productId,
      qty,
      wmCode: json.code,
      wmMessage: json.msg,
    });
    throw new WorldmoveRejectionError(json.code, json.msg);
  }

  console.log("Worldmove order-and-redeem succeeded", {
    intentId,
    email,
    wmOrderId: json.orderId,
    productId: plan.productId,
    qty,
  });
  return json.orderId;
};

export const orderEAPlan = async (intentId, email, plan, qty) => {
    return null; // not implemented yet
}