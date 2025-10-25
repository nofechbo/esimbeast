import { getPlanByuniqueName } from '@/lib/db/plans';
import { prisma } from '@/lib/db/prisma';
import { isValidMetadata } from '@/lib/VerifyMetadata';
import { generateEncStr } from '@/utils/generateEncStr';
import 'dotenv/config';
import https from 'https';

const url = process.env.ORDER_AND_REDEEM_URL
const merchantId = process.env.MERCHANT_ID;
const deptId = process.env.DEPT_ID;
const token = process.env.TOKEN;
const qrcodeType = 2; 

// TLS-bypass agent (required for test environment only)
const agent = new https.Agent({ rejectUnauthorized: false });

export default async function handler(req, res) {
     if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { email,  metadata } = req.body;
    console.log('metadata: ', metadata);
    if (!email || !isValidMetadata(metadata)) {
        return res.status(400).json({ error: 'Missing email or metadata' });
    }

    const plan = await getPlanByuniqueName(metadata.uniqueName);
    if (!plan) {
        return res.status(400).json({ error: 'Invalid plan uniqueName in metadata' });
    }

    const qty = parseInt(metadata.qty, 10);
        if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Invalid qty' });
    }

    const prodList = [{
        wmproductId: plan.productId,
        qty: metadata.qty
    }]

    /** @type {any} */
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
            // @ts-ignore
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
   await Promise.all(
        Array.from({ length: qty }, () =>
            createOrderInDB(json.orderId, email, plan)
        )
    );
    
    return res.status(200).json({ ok: true, orderId: json.orderId });
}

async function createOrderInDB(orderId, email, plan) {
    const { productId, name, countryCodes, data, days, price, } = plan;

    const newOrder = await prisma.planOrder.create({
        data: {
            orderId,
            email,
            productId,
            productName: name,
            countryCodes,
            data,
            duration: days,
            price,
            orderTime: new Date()
        }
    })

    return newOrder
}
