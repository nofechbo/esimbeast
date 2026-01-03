import { generateEncStr } from '@/utils/generateEncStr';
import { WM_USAGE_QUERY_URL, WM_MERCHANT_ID, WM_TOKEN } from "@/config";

const url = WM_USAGE_QUERY_URL;
const merchantId = WM_MERCHANT_ID;
const token = WM_TOKEN;

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
            console.error(`Worldmove API error for rcode ${rcode}: ${data.msg}`);
            return res.status(400).json({ error: 'Invalid or expired redemption code. Please check and try again.' });
        }
        
        // send response
        return res.status(200).json(data);

    } catch (err) {
        console.error(`Failed to fetch plan status for rcode ${rcode}: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch plan status' });
    }

}