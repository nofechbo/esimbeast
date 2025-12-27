import { SITE_NAME } from '@/config';
import nodemailer from 'nodemailer';

const from = `${SITE_NAME} <${process.env.GMAIL_ADDRESS}>`;

export async function sendEmail(to, subject, html) {
    if (typeof to !== 'string' || typeof subject !== 'string' || typeof html !== 'string') {
        throw Error("Invalid or missing email parameters");
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_ADDRESS,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });

        console.log(`Sent email to ${to} with subject "${subject}"`);
        return true;

    } catch (err) {
        console.error(`Failed to send email to ${to}: ${err.message}`);
        return false //to not crash the whole process
    }
}