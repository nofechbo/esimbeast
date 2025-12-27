import { SITE_NAME } from "@/config";
import { sendEmail } from "./sendEmail";

const from = `${SITE_NAME} <${process.env.GMAIL_ADDRESS}>`;

export async function sendVerificationEmail(email) {
    if (typeof email !== 'string') throw Error("Invalid or missing email");

    //generate a random 6-digit string
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const message = `<h2>Welcome to ${SITE_NAME}!</h2>
                    <p>Thank you for choosing us for your esim needs.</p>
                    <p>Please use this code to verify your email and complete your purchase:
                    <p> ${code} </p>
                    <p>Always here for you,</p>
                    <p>${SITE_NAME}</p>`;

    const sent = await sendEmail(email, `Your ${SITE_NAME} verification code`, message);
    if (!sent) console.error(`Failed to send verification code ${code} to ${email}`);
    else console.log(`Sent verification code ${code} to ${email}`);
    
    return code;
}