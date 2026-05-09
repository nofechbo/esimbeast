import { prisma } from "./prisma.js";
import { ORDER_STATUS } from "./types.js";

export async function updateSuccessfulPlanOrder(
  supplier,
  items,
  orderId,
  orders,
) {
  await Promise.all(
    items.map((item, i) =>
      prisma.planOrder.update({
        where: { id: orders[i].id },
        data: {
          qrLink: item.qrLink,
          lpa: item.lpa,
          supplierOrderData: item.supplierOrderData,
          status: ORDER_STATUS.FULFILLED,
        },
      }),
    ),
  );
  console.log(
    `updated DB for supplier ${supplier} and order ${orderId} successfully`,
  );
}
