import { generateEncStr } from '@/utils/generateEncStr';
import 'dotenv/config';
import https from 'https';

const url = process.env.TEST_ORDER_AND_REDEEM_URL
const merchantId = process.env.TEST_MERCHANT_ID;
const deptId = process.env.TEST_DEPT_ID;
const token = process.env.TEST_TOKEN;
const qrcodeType = 2; 

// TLS-bypass agent (required for test environment only)
const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
     if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { email,  metadata } = req.body;
    if (!email || !metadata?.productId || !metadata?.qty) {
        return res.status(400).json({ error: 'Missing email, productId or qty in metadata' });
    }
    const prodList = [{
        wmproductId: metadata.productId,
        qty: metadata.qty
    }]

    try {
        const encStr = generateEncStr({ merchantId, deptId, qrcodeType, prodList }, token);

        const requestBody = {
            merchantId,
            deptId,
            qrcodeType,
            prodList,
            encStr
        };

        const wmRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            agent // required to bypass TLS rejection in Worldmove test env
        });

        const json = await wmRes.json();
        if (json.code !== 0) {
            return res.status(502).json({ error: 'Worldmove rejected request', details: json });
        }

        console.log('🎯 Callback should hit callback endpoint shortly.');
        
        //add write data to db
        
        return res.status(200).json({ ok: true, orderId: json.orderId });

    } catch (err) {
        console.error('error in order-and-redeem api', err)
        res.status(500).json({ error: 'Failed to order and redeem plan' });
    }
}

/*
amount: purchasedPlan.price * 100, // stripe expects price in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata: {
                productId: purchasedPlan.productId,
                qty: 1, //current plug
                planName: purchasedPlan.name,
                data: purchasedPlan.dataCap,
                duration: purchasedPlan.validity,
                // price: purchasedPlan.price //do we need it? we have amount...
            },
        });
*/