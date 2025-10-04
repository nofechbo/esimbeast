import { validateEncStr } from "@/lib/validateEncStr";
import { prisma } from "@/lib/db/prisma";


// add sending email to user with qr code and lpa
//handling - what if errors happen here? user will still see "check your email"

export default async function handler(req, res) {
    if (req.method !== "POST") {
        console.error("Invalid request method");
        res.setHeader('Allow', 'POST');
        return res.status(405).send("Method Not Allowed");
    }

    const data = req.body
    console.log(data)

    if (!validateEncStr(data)) {
        console.error("Invalid encStr in callback data");
        return res.status(400).send("Invalid encStr");
    }

    const { orderId, itemList } = data;
    if (!orderId || !Array.isArray(itemList) || itemList.length === 0) {
        console.error("Missing orderId or itemList in callback data");
        return res.status(400).send("Missing orderId or itemList");
    }

    const orders = await prisma.planOrder.findMany({ where: { orderId } });
    if (orders.length === 0) {
        console.error(`No orders found for orderId: ${orderId}`);
        return res.status(404).send("No orders found for this orderId");
    }
    if (orders.length !== itemList.length) { //if for some reason WM has more/less items than db per orderId
        console.error(`Item count mismatch for order ${orderId}: received ${itemList.length}, expected ${orders.length}`);
        return res.status(400).send("Item count mismatch");
     }
    
    await Promise.all(
        itemList.map((item, i) =>
            prisma.planOrder.update({
                where: { id: orders[i].id },
                data: {
                    qrLink: item.qrcode,
                    lpa: item.qrcodeContent,
                },
            })
        )
    );

    return res.status(200).send("1"); //WM will keep trying if receive anything but 1... do we only want to send them 1 on complete success? they'll re-send the same data anyway
}