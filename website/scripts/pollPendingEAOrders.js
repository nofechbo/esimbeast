import { ORDER_STATUS } from "@/lib/db/types.js";
import { ESIMACCESS_API_BASE } from "@/lib/esimaccess.js";
import { ESIMACCESS_ACCESS_CODE } from "../config.js";
import { updateSuccessfulPlanOrder } from "../lib/db/orders.js";
import { prisma } from "../lib/db/prisma.js";
import { sendOrderInfo } from "../lib/email/sendOrderInfo.js";

/**
 * Cronjob: pollPendingEAOrders
 * Reads pending EA orders, marks any older than ORDER_WINDOW as timed_out,
 * then queries EA's /esim/query endpoint for the rest,
 * and if ready — updates the DB and sends the customer a confirmation email.
 **/

const ORDER_WINDOW = 1000 * 60 * 30; // 30 minutes
const ESIMACCESS_API_URL = `${ESIMACCESS_API_BASE}/query`;
const EA_STILL_ALLOCATING_ERROR_CODE = "200010";

async function fetchEAOrderData(orderNo) {
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

    if (!res.ok) {
      console.error(
        `EA API error for order ${orderNo}, with status code ${res.status}`,
      );
      return null;
    }

    data = await res.json();
    if (data.errorCode === EA_STILL_ALLOCATING_ERROR_CODE) {
      console.log(`Order ${orderNo} still allocating, skipping.`);
      return null;
    }
    if (!data.success) {
      console.error(`Order ${orderNo} query failed`, data);
      return null;
    }

    console.log(
      `Received successful response from EA for order ${orderNo}, updating DB...`,
    );
  } catch (error) {
    console.error(
      `Error occurred while querying EA for order ${orderNo}:`,
      error,
    );
    return null;
  }

  return data;
}

async function main() {
  console.log("Starting to poll pending EA orders...\n");

  // step 1: find all pending EA orders
  let pendingOrders = await prisma.planOrder.findMany({
    where: {
      supplier: "EA",
      status: ORDER_STATUS.PENDING,
    },
  });
  console.log(`Found ${pendingOrders.length} pending EA orders.`);

  // step 2: mark any past-window orders as timed_out and remove them from pendingOrders
  const cutoff = new Date(Date.now() - ORDER_WINDOW);
  const expired = pendingOrders.filter((o) => o.orderTime < cutoff);

  if (expired.length > 0) {
    await prisma.planOrder.updateMany({
      where: { id: { in: expired.map((o) => o.id) } },
      data: { status: ORDER_STATUS.TIMED_OUT },
    });
    pendingOrders = pendingOrders.filter((o) => o.orderTime >= cutoff);
    console.log(`Marked ${expired.length} EA orders as timed_out.`);
  }

  if (pendingOrders.length === 0) {
    console.log("No pending EA orders to poll. Exiting.");
    return;
  }

  // step 3: for each pending order, query EA's /esim/query endpoint
  const ordersById = new Map();
  for (const order of pendingOrders) {
    if (!ordersById.has(order.orderId)) {
      ordersById.set(order.orderId, []);
    }
    ordersById.get(order.orderId).push(order);
  }

  console.log("querying EA for each pending order batch...");
  for (const [orderNo, orders] of ordersById) {
    const data = await fetchEAOrderData(orderNo);
    if (!data) {
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

    // step 4: update the DB for orders in this batch with the data received from EA and send email to user
    const mappedItems = esimList.map((esimData) => ({
      qrLink: esimData.qrCodeUrl,
      lpa: esimData.ac,
      supplierOrderData: { esimTranNo: esimData.esimTranNo },
    }));

    await updateSuccessfulPlanOrder("EA", mappedItems, orderNo, orders);
    console.log(`Order ${orderNo} updated successfully.`);

    await sendOrderInfo("EA", orders, orderNo, mappedItems);
    console.log(`Order ${orderNo} email sent successfully.`);
  }
}

main();
