import { validateEncStr } from "@/lib/validateEncStr";
import { prisma } from "@/lib/db/prisma";
import { updateSuccessfulPlanOrder } from "@/lib/db/orders";
import { sendOrderInfo } from "@/lib/email/sendOrderInfo";

//handling - what if errors happen here? user will still see "check your email"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const data = req.body;
  console.log("Received Worldmove callback", data);

  if (!validateEncStr(data)) {
    console.error("Invalid encStr in WM callback", { orderId: data.orderId });
    return res.status(400).send("Invalid encStr");
  }

  const { orderId, itemList } = data;
  if (!orderId || !Array.isArray(itemList) || itemList.length === 0) {
    console.error("Missing orderId or itemList in WM callback data");
    return res.status(400).send("Missing orderId or itemList");
  }

  console.log(`Finding orders in DB for WM orderId ${orderId}...`);
  const orders = await prisma.planOrder.findMany({
    where: { supplier: "WM", orderId, status: "pending" },
  });
  if (orders.length === 0) {
    console.error(`No pending WM orders found for orderId: ${orderId}`);
    return res.status(404).send("No pending orders found for this orderId");
  }
  if (orders.length !== itemList.length) {
    //if for some reason WM has more/less items than db per orderId
    console.error(
      `Item count mismatch for WM order ${orderId}: received ${itemList.length}, expected ${orders.length}`,
    );
    return res.status(400).send("Item count mismatch");
  }

  console.log(
    `found ${orders.length} orders, updating DB for WM order ${orderId}...`,
  );
  const items = itemList.map((item) => ({
    qrLink: item.qrcode,
    lpa: item.qrcodeContent,
    supplierOrderData: { rcode: item.rcode },
  }));

  try {
    await updateSuccessfulPlanOrder("WM", items, orderId, orders);
  } catch (error) {
    console.error(`Failed to update DB for WM order ${orderId}:`, error);
    return res.status(500).send("Failed to update order data");
  }

  console.log(`Sending email for WM order ${orderId}`);
  try {
    await sendOrderInfo("WM", orders, orderId, items);
  } catch (error) {
    console.error(
      `Failed to send order info email for WM order ${orderId}:`,
      error,
    );
    res.status(500).send("Failed to send order info email");
  }

  console.log("WM callback processed successfully", {
    orderId,
    itemCount: itemList.length,
  });
  return res.status(200).send("1");
}
