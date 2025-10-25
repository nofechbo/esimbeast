import { generateEncStr } from '@/utils/generateEncStr';

const url = process.env.ORDER_AND_REDEEM_URL
const merchantId = process.env.MERCHANT_ID;
const token = process.env.TOKEN;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const { rcode } = req.query;
    if (typeof rcode !== 'string' || !rcode) {
        return res.status(400).json({ error: 'Missing or invalid rcode parameter' });
    }

    try {
        const encStr = generateEncStr({ merchantId, rcode }, token);

        const requestBody = {
            merchantId,
            rcode,
            encStr
        };
    
        const wmRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const data = await wmRes.json();
        if (data.code !== 0) {
            return res.status(400).json({ error: data.msg || 'Failed to fetch plan status from Worldmove' });
        }
        
        // send response
        return res.status(200).json(data);

    } catch (err) {
        console.error(`Failed to fetch plan status for rcode ${rcode}: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch plan status' });
    }

}