import nodemailer from 'nodemailer';

const APP_NAME = "Pingwe"
const from = `${APP_NAME} <${process.env.GMAIL_ADDRESS}>`;

export async function sendVerificationEmail(email) {
    if (typeof email !== 'string') throw Error("Invalid or missing email");

    //generate a random 6-digit string
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // or 587 with secure: false
        secure: true,
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const message = `<h2>Welcome to ${APP_NAME}!</h2>
                    <p>Thank you for choosing us for your esim needs.</p>
                    <p>Please use this code to verify your email and complete your purchase:
                    <p> ${code} </p>
                    <p>Always here for you,</p>
                    <p>${APP_NAME}</p>`;
    console.log("connecting to gmail…")
    const info = await transporter.sendMail({
        from,
        to: email,
        subject: `Verify your email`,
        html: message,
    });

    console.log(`Sent verification code ${code} to ${email}`);
    return code;
}