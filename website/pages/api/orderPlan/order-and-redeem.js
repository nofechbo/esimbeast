import { getPlanByuniqueName } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { appendReferralRow } from "@/lib/googleSheets";
import { isValidMetadata } from "@/lib/VerifyMetadata";
import { formatDataSize } from "@/utils/formaters";
import { generateEncStr } from "@/utils/generateEncStr";
import { WM_ORDER_AND_REDEEM_URL, WM_MERCHANT_ID, WM_TOKEN, WM_DEPT_ID } from "@/config";
import "dotenv/config";
import Stripe from "stripe";

const url = WM_ORDER_AND_REDEEM_URL;
const merchantId = WM_MERCHANT_ID;
const deptId = WM_DEPT_ID;
const token = WM_TOKEN;
const qrcodeType = 2;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createOrderInDB(intentId, email, plan) {
  const { productId, name, countryCodes, data, days, price, supplier } = plan;

  const newOrder = await prisma.planOrder.create({
    data: {
      intentId,
      email,
      productId,
      productName: name,
      countryCodes,
      data,
      duration: days,
      price,
      orderTime: new Date(),
      supplier
    },
  });

  return newOrder;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    console.error("Method Not Allowed:", req.method);
    return res.status(405).end("Method Not Allowed");
  }

  const { intentId, referralCode } = req.body;
  let intent;

  if (!intentId) {
    console.error("Missing intentId in request body");
    return res.status(400).json({ error: "Missing intentId" });
  }

  try {
    intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(400).json({ error: "invalid payment" });
  }

  // prevent duplicate redeems!
  const intentExists = await prisma.planOrder.findFirst({
    where: { intentId },
  });
  if (intentExists) {
    console.warn("Order already exists for intentId:", intentId);
    return res.status(200).json({ ok: true, intent });
  }

  const metadata = intent.metadata;
  if (!isValidMetadata(metadata)) {
    console.error("Invalid metadata:", metadata);
    return res.status(400).json({ error: "Invalid metadata", intent });
  }
  const email = intent.receipt_email;

  const plan = await getPlanByuniqueName(metadata.uniqueName);
  if (!plan) {
    console.error("Plan not found for uniqueName:", metadata.uniqueName);
    return res
      .status(400)
      .json({ error: "Invalid plan uniqueName in metadata", intent });
  }

  const qty = parseInt(metadata.qty, 10);
  if (isNaN(qty) || qty <= 0) {
    console.error("Invalid qty in metadata:", metadata.qty);
    return res.status(400).json({ error: "Invalid qty", intent });
  }

  //create row in db qty times
  await Promise.all(
    Array.from({ length: qty }, () => createOrderInDB(intentId, email, plan))
  );

  const prodList = [
    {
      wmproductId: plan.productId,
      qty: metadata.qty,
    },
  ];

  /** @type {any} */
  let json;

  try {
    const encStr = generateEncStr(
      { merchantId, deptId, qrcodeType, prodList },
      token
    );

    const requestBody = {
      merchantId,
      deptId,
      qrcodeType,
      prodList,
      encStr,
    };

    console.log("Worldmove order-and-redeem request", {
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
      return res.status(502).json({ error: "Worldmove service error", intent });
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
      return res
        .status(502)
        .json({ error: "Worldmove rejected request", details: json, intent });
    }

    console.log("Worldmove order-and-redeem succeeded", {
      intentId,
      email,
      wmOrderId: json.orderId,
      productId: plan.productId,
      qty,
    });
  } catch (err) {
    console.error("Worldmove order-and-redeem failed", {
      intentId,
      email,
      productId: plan.productId,
      qty,
      errorName: err.name,
      errorMessage: err.message,
    });
    return res.status(500).json({ error: "Failed to order and redeem plan", intent });
  }

  await prisma.planOrder.updateMany({
    where: { intentId },
    data: { orderId: json.orderId },
  });

  //update referral info:
  if (referralCode) {
    const referralData = {
      referralCode,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      planName: plan.name,
      countryCodes: plan.countryCodes.join(", "),
      data: formatDataSize(plan.data),
      price: (plan.price / 100).toFixed(2), // convert cents to dollars for spreadsheet
      qty,
      currency: intent.currency,
      email,
    };

    try {
      await appendReferralRow(referralData);

      console.log("Referral row appended to Google Sheet", referralData);
    } catch (err) {
      console.error(
        "Failed to append referral row to Google Sheets:",
        err,
        "data:",
        referralData
      );
    }
  }

  return res.status(200).json({ intent });
}
