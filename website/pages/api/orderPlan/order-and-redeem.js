/*************************************
 * 
 * 
 * NEED TO ADJUST FOR RECEIVING ORDER OF MULTIPLE DIFFERENT PLANS!!!
 * 
 * 
 *************************************/

import { prisma } from '@/lib/db/prisma';
import { isValidMetadata } from '@/lib/VerifyMetadata';
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
    console.log('metadata: ', metadata);
    if (!email || !isValidMetadata(metadata) || !metadata?.qty) {
        return res.status(400).json({ error: 'Missing email or metadata' });
    }

    const prodList = [{
        wmproductId: metadata.productId,
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
        Array.from({ length: metadata.qty }, () =>
            createOrderInDB(json.orderId, email, metadata)
        )
    );
    
    return res.status(200).json({ ok: true, orderId: json.orderId });
}

async function createOrderInDB(orderId, email, orderMetadata) {
        let {
            productId,
            planName,
            countryCodes,
            data,
            duration,
            price,
        } = orderMetadata;

        // normalize countryCodes to array
        if (!Array.isArray(countryCodes)) {
            countryCodes = [countryCodes];
        }
        
        // normalize data → GB (Decimal or Float)
        if (typeof data === "string") {
            const normalized = data.toLowerCase().trim();

            if (normalized.endsWith("gb")) {
                data = parseFloat(normalized.replace("gb", "").trim());
            } else if (normalized.endsWith("mb")) {
                data = parseFloat(normalized.replace("mb", "").trim()) / 1000;
            } else {
                // fallback: just try parseFloat, could be "1.5" already
                data = parseFloat(normalized);
            }
        }
        
        // duration: ensure Int
        duration = parseInt(duration, 10);

        // price: ensure Decimal-friendly number
        price = parseFloat(price);

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
