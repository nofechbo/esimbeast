import { prisma } from "./prisma";

export async function updatePlanOrder(supplier, items, orderId, orders) {
  await Promise.all(
    items.map((item, i) =>
      prisma.planOrder.update({
        where: { id: orders[i].id },
        data: {
          qrLink: item.qrLink,
          lpa: item.lpa,
          supplierOrderData: item.supplierOrderData,
        },
      }),
    ),
  );
  console.log(
    `updated DB for supplier ${supplier} and order ${orderId} successfully`,
  );
}
