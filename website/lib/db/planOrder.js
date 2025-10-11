import { prisma } from "./prisma";

export async function getPlanByRcode(rcode) {
    const order = await prisma.planOrder.findUnique({
        where: { rcode }
    });

    return order;
}
    