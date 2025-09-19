
/*************************************
 * 
 * 
 * NEED TO ADJUST FOR RECEIVING ORDER OF MULTIPLE DIFFERENT PLANS!!!
 * 
 * 
 *************************************/

import { RequiredOrderMetadata } from '@/lib/VerifyMetadata';
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
    if (!email || !RequiredOrderMetadata(metadata) || !metadata?.qty) {
        return res.status(400).json({ error: 'Missing email or metadata' });
    }

    const prodList = [{
        wmproductId: metadata.productId,
        qty: metadata.qty
    }]

    let json;

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

        json = await wmRes.json();
        if (json.code !== 0) {
            return res.status(502).json({ error: 'Worldmove rejected request', details: json });
        }

        console.log('🎯 Callback should hit callback endpoint shortly.');

    } catch (err) {
        console.error('error in order-and-redeem api', err)
        res.status(500).json({ error: 'Failed to order and redeem plan' });
    }

    //create row in db qty times
    await Promise.all(Array.from({ length: qty }, () => createOrderInDB(metadata)));
    
    return res.status(200).json({ ok: true, orderId: json.orderId });
}

async function createOrderInDB(orderId, email, orderMetadata) {
        const {
            productId,
            planName,
            countryCodes,
            data,
            duration,
            price, //can get from stripe instead of metadata
        } = orderMetadata

        const newOrder = await prisma.planOrder.create({
            data: {
                orderId,
                email,
                productId,
                productName: planName,
                countryCodes,
                data,
                duration,
                price,
                orderTime: new Date()
            }
        })

        return newOrder
}
