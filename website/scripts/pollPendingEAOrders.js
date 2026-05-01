import { ESIMACCESS_ACCESS_CODE } from "@/config";
import { updatePlanOrder } from "@/lib/db/orders";
import { prisma } from "@/lib/db/prisma";
import { sendOrderInfo } from "@/lib/email/sendOrderInfo";

/**
 * Cronjob: pollPendingEAOrders
 * Runs every 10 seconds. Finds all EA orders placed in the last 5 minutes
 * that are still pending (no qrLink), queries EA's /esim/query endpoint for each,
 * and if ready — updates the DB and sends the customer a confirmation email.
 **/

const ORDER_WINDOW = 1000 * 60 * 5; // 5 minutes
const ESIMACCESS_API_URL = "https://api.esimaccess.com/api/v1/open/esim/query";
const EA_STILL_ALLOCATING_ERROR_CODE = "200010";

async function main() {
  console.log("Starting to poll pending EA orders...\n");
  let pendingOrders;
  try {
    pendingOrders = await prisma.planOrder.findMany({
      where: {
        supplier: "EA",
        qrLink: null,
        orderTime: { gte: new Date(Date.now() - ORDER_WINDOW) },
      },
    }); //how to flag orders older then 5 minutes? do we want to?
    console.log(`Found ${pendingOrders.length} pending EA orders.`);
  } catch (error) {
    console.error("Error occurred while polling pending EA orders:", error);
  }

  const batchOrdersById = new Map();
  for (const order of pendingOrders) {
    if (!batchOrdersById.has(order.orderId)) {
      batchOrdersById.set(order.orderId, []);
    }
    batchOrdersById.get(order.orderId).push(order);
  }

  console.log("querying EA for each pending order batch...");
  for (const [orderNo, orders] of batchOrdersById) {
    let data;
    try {
      const res = await fetch(ESIMACCESS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "RT-AccessCode": ESIMACCESS_ACCESS_CODE,
        },
        body: JSON.stringify({
          orderNo,
          pager: { pageNum: 1, pageSize: 50 },
        }),
      });

      data = await res.json();

      if (!res.ok) {
        console.error(`EA API error for order ${orderNo}:`, data);
        continue;
      }
      if (data.errorCode === EA_STILL_ALLOCATING_ERROR_CODE) {
        console.log(`Order ${orderNo} still allocating, skipping.`);
        continue;
      }
      if (!data.success) {
        console.error(
          `Order ${orderNo} query failed, flagging for manual review.`,
          data,
        );
        // TODO: flag for manual review??
        continue;
      }

      console.log(
        `Received successful response from EA for order ${orderNo}, updating DB...`,
      );
    } catch (error) {
      console.error(
        `Error occurred while querying EA for order ${orderNo}:`,
        error,
      );
      continue;
    }

    const esimList = data.obj.esimList;
    if (esimList.length !== orders.length) {
      console.error(
        `eSIM count mismatch for order ${orderNo}: expected ${orders.length}, got ${esimList.length}. skipping.`,
        data,
      );
      continue;
    }

    const mappedItems = esimList.map((esimData) => ({
      qrLink: esimData.qrCodeUrl,
      lpa: esimData.ac,
      supplierOrderData: { esimTranNo: esimData.esimTranNo },
    }));

    try {
      await updatePlanOrder("EA", mappedItems, orderNo, orders);
      console.log(`Order ${orderNo} updated successfully.`);
    } catch (error) {
      console.error(
        `Error occurred while processing EA eSim data for order ${orderNo}:`,
        error,
      );
    }

    try {
      await sendOrderInfo("EA", orders, orderNo, mappedItems);
    } catch (error) {
      console.error(
        `Error occurred while sending order info email for EA order ${orderNo}:`,
        error,
      );
      continue;
    }
  }
}
