import { prisma } from "@/lib/db/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  try {
    const orders = await prisma.planOrder.findMany({
      orderBy: { orderTime: "desc" },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const normalizedOrders = orders.map((order) => ({
      ...order,
      data: Number(order.data),
    }));

    return res.status(200).json(normalizedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
}
