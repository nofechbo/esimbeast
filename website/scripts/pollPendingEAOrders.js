import { ESIMACCESS_ACCESS_CODE } from "@/config";
import { updateSuccessfulPlanOrder } from "@/lib/db/orders";
import { prisma } from "@/lib/db/prisma";
import { sendOrderInfo } from "@/lib/email/sendOrderInfo";

/**
 * Cronjob: pollPendingEAOrders
 * Runs every 10 seconds. Finds all EA orders placed in the last 5 minutes
 * that are still pending (no qrLink), queries EA's /esim/query endpoint for each,
 * and if ready — updates the DB and sends the customer a confirmation email.
 **/

const ORDER_WINDOW = 1000 * 60 * 30; // 30 minutes
const ESIMACCESS_API_URL = "https://api.esimaccess.com/api/v1/open/esim/query";
const EA_STILL_ALLOCATING_ERROR_CODE = "200010";

async function main() {
  console.log("Starting to poll pending EA orders...\n");

  // step 1: find all pending EA orders that were placed more than ORDER_WINDOW ago, and mark them as timed_out
  const timedOutOrders = await prisma.planOrder.updateMany({
    where: {
      supplier: "EA",
      status: "pending",
      orderTime: { lt: new Date(Date.now() - ORDER_WINDOW) },
    },
    data: {
      status: "timed_out",
    },
  });
  console.log(`Found and logged ${timedOutOrders.count} timed-out EA orders.`);

  // step 2: find all pending EA orders that were placed within the ORDER_WINDOW
  let pendingOrders;
  try {
    pendingOrders = await prisma.planOrder.findMany({
      where: {
        supplier: "EA",
        status: "pending",
      },
    });
    console.log(`Found ${pendingOrders.length} pending EA orders.`);
  } catch (error) {
    console.error("Error occurred while polling pending EA orders:", error);
  }

  // step 3: for each pending order, query EA's /esim/query endpoint
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

    // step 4: update the DB for orders in this batch with the data received from EA
    const mappedItems = esimList.map((esimData) => ({
      qrLink: esimData.qrCodeUrl,
      lpa: esimData.ac,
      supplierOrderData: { esimTranNo: esimData.esimTranNo },
    }));

    try {
      await updateSuccessfulPlanOrder("EA", mappedItems, orderNo, orders);
      console.log(`Order ${orderNo} updated successfully.`);
    } catch (error) {
      console.error(
        `Error occurred while processing EA eSim data for order ${orderNo}:`,
        error,
      );
    }

    // step 5: send confirmation email to customer
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
