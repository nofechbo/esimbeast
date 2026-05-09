import { getPlanByuniqueName } from "@/lib/db/plans";
import { prisma } from "@/lib/db/prisma";
import { appendReferralRow } from "@/lib/googleSheets";
import { isValidMetadata } from "@/lib/VerifyMetadata";
import { formatDataSize } from "@/utils/formaters";
import "dotenv/config";
import Stripe from "stripe";
import {
  EsimAccessApiError,
  EsimAccessRejectionError,
  supplierToOrderFunction,
  WorldmoveApiError,
  WorldmoveRejectionError,
} from "./orderUtils";

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
      supplier,
    },
  });

  return newOrder;
}

function log(message) {
  console.log(`[order-and-redeem] ${message}`);
}
function error(message, req) {
  console.error(`[order-and-redeem] ${message}`, { body: req.body });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    error(`Method Not Allowed: ${req.method}`, req);
    return res.status(405).end("Method Not Allowed");
  }

  const { intentId, referralCode } = req.body;
  let intent;

  if (!intentId) {
    error("Missing intentId in request body", req);
    return res.status(400).json({ error: "Missing intentId" });
  }

  log(`starting order for intentId: ${intentId}`);

  try {
    intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }
  } catch (err) {
    error(`Stripe error: ${err.message}`, req);
    return res.status(400).json({ error: "invalid payment" });
  }
  log(`Stripe payment retrieved successfully for intentId: ${intentId}`);

  // prevent duplicate redeems!
  const intentExists = await prisma.planOrder.findFirst({
    where: { intentId },
  });
  if (intentExists) {
    log(`Order already exists for intentId: ${intentId}`);
    return res.status(200).json({ ok: true, intent });
  }

  const metadata = intent.metadata;
  if (!isValidMetadata(metadata)) {
    error(`Invalid metadata ${JSON.stringify(metadata)}`, req);
    return res.status(400).json({ error: "Invalid metadata", intent });
  }
  const email = intent.receipt_email;
  log(
    `Metadata and email extracted: email=${email}, uniqueName=${metadata.uniqueName}, qty=${metadata.qty} for intentId: ${intentId}`,
  );

  const plan = await getPlanByuniqueName(metadata.uniqueName);
  if (!plan) {
    error(`Plan not found for uniqueName: ${metadata.uniqueName}`, req);
    return res
      .status(400)
      .json({ error: "Invalid plan uniqueName in metadata", intent });
  }
  log(
    `Plan retrieved successfully for uniqueName: ${metadata.uniqueName}, planId: ${plan.id} for intentId: ${intentId}`,
  );

  const qty = parseInt(metadata.qty, 10);
  if (isNaN(qty) || qty <= 0) {
    error(`Invalid qty in metadata: ${JSON.stringify(metadata)}`, req);
    return res.status(400).json({ error: "Invalid qty", intent });
  }

  //create row in db qty times
  await Promise.all(
    Array.from({ length: qty }, () => createOrderInDB(intentId, email, plan)),
  );
  log(`Created ${qty} order records in DB for intentId: ${intentId}`);

  const supplier = plan.supplier;
  if (!supplier) {
    error(`No supplier specified for plan: ${plan.name}`, req);
    return res.status(500).json({ error: "Plan configuration error", intent });
  }
  if (!supplierToOrderFunction[supplier]) {
    error(`No order function for supplier: ${supplier}`, req);
    return res.status(500).json({ error: "Unsupported supplier", intent });
  }

  let orderId;
  try {
    orderId = await supplierToOrderFunction[supplier](
      intentId,
      email,
      plan,
      qty,
    );
  } catch (err) {
    if (
      err instanceof WorldmoveApiError ||
      err instanceof WorldmoveRejectionError ||
      err instanceof EsimAccessApiError ||
      err instanceof EsimAccessRejectionError
    ) {
      return res.status(502).json({ error: err.body, intent });
    }
    error(
      `${supplier} order-and-redeem failed ${JSON.stringify({
        intentId,
        email,
        productId: plan.productId,
        qty,
        errorName: err.name,
        errorMessage: err.message,
      })}`,
      req,
    );
    return res
      .status(500)
      .json({ error: "Failed to order and redeem plan", intent });
  }

  try {
    const { count } = await prisma.planOrder.updateMany({
      where: { intentId },
      data: { orderId: orderId },
    });
    log(`updated ${count} order records in DB for intentId: ${intentId}`);
  } catch (err) {
    error(
      `Failed to update orderId in DB: ${JSON.stringify({
        intentId,
        orderId,
        error: err,
      })}`,
      req,
    );
    return res
      .status(500)
      .json({ error: "Failed to update order in database", intent });
  }

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
      log(
        `Appending referral row to Google Sheet for referralCode: ${referralCode}, intentId: ${intentId}`,
      );
      await appendReferralRow(referralData);

      log(
        `Referral row appended to Google Sheet: ${JSON.stringify(referralData)}`,
      );
    } catch (err) {
      error(
        `Failed to append referral row to Google Sheets: ${JSON.stringify({
          error: err,
          data: referralData,
        })}`,
        req,
      );
    }
  }

  log(`completed successfully for intentId: ${intentId}, orderId: ${orderId}`);
  return res.status(200).json({ intent });
}
