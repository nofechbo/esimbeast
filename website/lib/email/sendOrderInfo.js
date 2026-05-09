import { SITE_NAME, SITE_URL, SKIP_EMAIL_SENDING } from "../../config.js";
import { sendEmail } from "./sendEmail.js";

export const sendOrderInfo = async (supplierName, orders, orderId, items) => {
  const email = orders[0].email; //all orders in the same orderId have the same email
  if (typeof email !== "string" || !email) {
    console.error(
      `Invalid email for orderId ${orderId} for supplier ${supplierName}`,
    );
    throw new Error("Invalid email associated with this order");
  }

  //send email to user for all items in the order
  if (!SKIP_EMAIL_SENDING) {
    const planDetails = items
      .map((item, i) => {
        const statusCode =
          supplierName === "WM"
            ? item.supplierOrderData.rcode
            : supplierName === "EA"
              ? item.supplierOrderData.esimTranNo
              : null;

        if (!statusCode) {
          console.error(
            `Unknown supplier ${supplierName}, cannot generate status link`,
          );
        }

        const statusLink = statusCode
          ? `${SITE_URL}/plan-status?supplier=${supplierName}&code=${statusCode}`
          : null;

        const dataDisplay =
          orders[i].data > 0 ? `${orders[i].data}GB` : "Unlimited data";
        const planHeader = items.length > 1 ? `<h3>Plan ${i + 1}:</h3>` : "";
        return `
            ${planHeader}
            <p><strong>Plan Name:</strong> ${orders[i].productName}</p>
            <p>${dataDisplay} for ${orders[i].duration} days</p>
            <p>To activate your plan, follow the link below and scan the QR code:
            <a href="${item.qrLink}" target="_blank" rel="noopener noreferrer">View QR Code</a></p>
            ${
              statusLink
                ? `<p>Check your data usage anytime:
            <a href="${statusLink}" target="_blank" rel="noopener noreferrer">View Plan Status</a></p>`
                : ""
            }
            <hr />
        `;
      })
      .join("");

    const emailContent = `
            <h2>Thank you for your purchase from ${SITE_NAME}!</h2>
            <p>Your order (ID: ${orderId}) has been successfully processed. Below are the details of your purchased eSIM plan(s):</p>
            ${planDetails}
            <p>If you have any questions or need further assistance, feel free to reply to this email.</p>
            <p>Best regards,<br/>The ${SITE_NAME} Team</p>
        `;

    const sent = await sendEmail(
      email,
      `Your ${SITE_NAME} eSIM Order ${orderId} Details`,
      emailContent,
    );
    if (!sent) {
      console.error(
        `Failed to send order details email to ${email} for orderId ${orderId}`,
      );
      throw new Error("Failed to send order details email");
    }

    console.log(`Sent order details email to ${email} for orderId ${orderId}`);
  } else {
    console.log(`Skipping email send for orderId ${orderId}`);
  }
};
