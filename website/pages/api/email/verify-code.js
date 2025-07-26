import { verificationCache } from "@/lib/email/emailVerificationCache";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { email, code } = req.body;

    const storedCode = verificationCache.get(email);

    if (!storedCode) {
        res.status(400).json({ error: "Verification code expired or not found" });
        return;
    }
    
    if (storedCode !== code) {
        res.status(400).json({ error: "Invalid code" });
        return;
    }

    // Valid → delete
    verificationCache.del(email);
    res.status(200).json({ message: 'Code verified successfully' });
}



