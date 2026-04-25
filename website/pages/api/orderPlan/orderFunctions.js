import {
  WM_DEPT_ID,
  WM_MERCHANT_ID,
  WM_ORDER_AND_REDEEM_URL,
  WM_TOKEN,
  ESIMACCESS_ACCESS_CODE,
} from "@/config";
import { generateEncStr } from "@/utils/generateEncStr";
import {
  EsimAccessApiError,
  EsimAccessRejectionError,
  WorldmoveApiError,
  WorldmoveRejectionError,
} from "./orderUtils";

export const orderWMPlan = async (intentId, email, plan, qty) => {
  const url = WM_ORDER_AND_REDEEM_URL;
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

  const wmRes = await fetch(url, {
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
    const errorBody = await wmRes.text();
    throw new WorldmoveApiError(wmRes.status, errorBody);
  }

  json = await wmRes.json();
  console.log("Worldmove order-and-redeem response:", json);

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
  const url = "https://api.esimaccess.com/api/v1/open/esim/order";
  const packageCode = plan.code;
  const price = plan.supplierPrice;
  const transactionId = intentId; // EA requires that we supply a unique transaction ID

  /** @type {any} */
  let json;

  console.log("EsimAccess order request:", {
    intentId,
    email,
    planName: plan.name,
    productId: plan.productId,
    qty,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": ESIMACCESS_ACCESS_CODE,
    },
    body: JSON.stringify({
      transactionId,
      amount: price * qty,
      packageInfoList: [
        {
          packageCode,
          count: qty,
          price,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("EA order API HTTP error", {
      intentId,
      email,
      httpStatus: res.status,
      productId: plan.productId,
      qty,
    });
    const errorBody = await res.text();
    throw new EsimAccessApiError(res.status, errorBody);
  }
  json = await res.json();
  console.log("EA returned:", json);

  if (json.success !== true) {
    console.error("EA order API rejected order", {
      intentId,
      email,
      productId: plan.productId,
      qty,
      response: json,
    });
    throw new EsimAccessRejectionError(
      json.errorCode || "unknown",
      json.errorMsg || "Unknown error",
    );
  }

  console.log("EA order API succeeded", {
    intentId,
    email,
    orderNo: json.obj.orderNo,
    productId: plan.productId,
    qty,
  });
  return json.obj.orderNo;
};
