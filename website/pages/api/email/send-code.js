import { sendVerificationEmail } from "@/utils/email/sendVerificationEmail";
import { verificationCache } from "@/utils/email/emailVerificationCache";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let { email } = req.body;

    if (typeof email !== 'string') {
        res.status(400).json({ error: "email must be included" });
        return;
    }
    //email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }

    email = email.trim().toLowerCase();

    try {
        const code = await sendVerificationEmail(email);
        const success = verificationCache.set(email, code);
        console.log(`Set code result: ${success}`); // should be true
        const stored = verificationCache.get(email);
        console.log(`Stored: ${stored}, Given: ${code}`);
        console.log(`Set code "${code}" for "${email}"`);

    } catch (err) {
        res.status(500).json({ error: 'Failed to send verification code' });
        console.error(err.message);
        return;
    }

    // send response
    res.status(200).json({
        message: 'Verification code sent',
        validForMinutes: 15
    });
}