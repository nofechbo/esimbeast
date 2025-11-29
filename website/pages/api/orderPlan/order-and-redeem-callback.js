import { validateEncStr } from "@/lib/validateEncStr";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/sendEmail";

//handling - what if errors happen here? user will still see "check your email"

const IS_RENDER = process.env.NEXT_PUBLIC_IS_RENDER === 'true';
const SITE_NAME = process.env.SITE_NAME || 'eSim Store';

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
    if (orders.some(o => o.qrLink || o.lpa || o.rcode)) { // shouldn't it be & ? to only block if all 3 were fileed?
        console.error(`Order ${orderId} has already been processed`);
        return res.status(400).send("Order has already been processed");
    }
    
    await Promise.all(
        itemList.map((item, i) =>
            prisma.planOrder.update({
                where: { id: orders[i].id },
                data: {
                    qrLink: item.qrcode,
                    lpa: item.qrcodeContent,
                    rcode: item.rcode,
                },
            })
        )
    );
    console.log(`updated DB for order ${orderId} successfully`);

    const email = orders[0].email; //all orders in the same orderId have the same email
    if (typeof email !== 'string' || !email) {
        console.error(`Invalid email for orderId ${orderId}`);
        return res.status(500).send("Invalid email associated with this order");
    }

    //send email to user with qr code and lpa links for all items in the order
    if (!IS_RENDER) {
        const planDetails = itemList.map((item, i) => `
            <h3>Plan ${i + 1}:</h3>
            <p><strong>Plan Name:</strong> ${orders[i].productName}</p>
            <p>${orders[i].data}GB for ${orders[i].duration} days</p>
            <p><strong>to activate your plan, follow the link below and scan the QR code:
            <a href="${item.qrcode}" target="_blank" rel="noopener noreferrer">View QR Code</a></p>

            <hr />
        `).join('');

        const emailContent = `
            <h2>Thank you for your purchase from ${SITE_NAME}!</h2>
            <p>Your order (ID: ${orderId}) has been successfully processed. Below are the details of your purchased eSIM plan(s):</p>
            ${planDetails}
            <p>If you have any questions or need further assistance, feel free to reply to this email.</p>
            <p>Best regards,<br/>The ${SITE_NAME} Team</p>
        `;

        const sent = await sendEmail(email, `Your ${SITE_NAME} eSIM Order ${orderId} Details`, emailContent);
        if (!sent) {
            console.error(`Failed to send order details email to ${email} for orderId ${orderId}`);
            return res.status(500).send("Failed to send order details email");
        }

        console.log(`Sent order details email to ${email} for orderId ${orderId}`);
    } else {
        console.log(`Skipping email send in Render environment for orderId ${orderId}`);
    }

    return res.status(200).send("1");
}