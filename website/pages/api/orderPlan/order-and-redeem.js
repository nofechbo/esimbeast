import { getPlanByuniqueName } from '@/lib/db/plans';
import { prisma } from '@/lib/db/prisma';
import { appendReferralRow } from '@/lib/googleSheets';
import { isValidMetadata } from '@/lib/VerifyMetadata';
import { generateEncStr } from '@/utils/generateEncStr';
import 'dotenv/config';
import https from 'https';
import Stripe from 'stripe';

const url = process.env.ORDER_AND_REDEEM_URL
const merchantId = process.env.MERCHANT_ID;
const deptId = process.env.DEPT_ID;
const token = process.env.TOKEN;
const qrcodeType = 2; 

// TLS-bypass agent (required for test environment only)
const agent = new https.Agent({ rejectUnauthorized: false });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createOrderInDB(intentId, email, plan) {
    const { productId, name, countryCodes, data, days, price, } = plan;

    const newOrder = await prisma.planOrder.create({
        data: {
            intentId,
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

export default async function handler(req, res) {
     if (req.method !== 'POST') {
         res.setHeader('Allow', 'POST');
         console.error('Method Not Allowed:', req.method);
        return res.status(405).end('Method Not Allowed');
    }

    const { intentId, referralCode } = req.body;
    let intent;

    if (!intentId) {
        console.error('Missing intentId in request body');
        return res.status(400).json({ error: 'Missing intentId' });
    }
    
    try {
        intent = await stripe.paymentIntents.retrieve(intentId);
        
        if (intent.status !== 'succeeded') {
            throw new Error('Payment not completed');
        }
    } catch (err) {
        console.error('Stripe error:', err);
        return res.status(400).json({ error: 'invalid payment' });
    }
    
    // prevent duplicate redeems!
    const intentExists = await prisma.planOrder.findFirst({ where: { intentId } });
    if (intentExists) {
        console.warn('Order already exists for intentId:', intentId);
        return res.status(200).json({ ok: true, intent }); 
    }

    const metadata = intent.metadata;
    if (!isValidMetadata(metadata)) {
        console.error('Invalid metadata:', metadata);
        return res.status(400).json({ error: 'Invalid metadata', intent });
    }
    const email = intent.receipt_email;

    const plan = await getPlanByuniqueName(metadata.uniqueName);
    if (!plan) {
        console.error('Plan not found for uniqueName:', metadata.uniqueName);
        return res.status(400).json({ error: 'Invalid plan uniqueName in metadata', intent });
    }
    
    const qty = parseInt(metadata.qty, 10);
    if (isNaN(qty) || qty <= 0) {
        console.error('Invalid qty in metadata:', metadata.qty);
        return res.status(400).json({ error: 'Invalid qty', intent });
    }

    //create row in db qty times
   await Promise.all(
        Array.from({ length: qty }, () =>
            createOrderInDB(intentId, email, plan)
        )
    );
    
    const prodList = [{
        wmproductId: plan.productId,
        qty: metadata.qty
    }]

    /** @type {any} */
    let json;

    //update referral info:
    if (referralCode) {
        const referralData = {
            referralCode,
            timestamp: new Date().toISOString(),
            planName: plan.name,
            countryCodes: plan.countryCodes.join(", "),
            data: plan.data,
            price: plan.price,
            currency: intent.currency,
            email
        }
        
        try {
            await appendReferralRow(referralData);
            
            console.log("Referral row appended to Google Sheet", referralData);
        } catch (err) {
            console.error('Failed to append referral row to Google Sheets:', err, 'data:', referralData);
        }
    }

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
            console.error('Worldmove rejected order-and-redeem request:', json);
            return res.status(502).json({ error: 'Worldmove rejected request', details: json, intent });
        }

        console.log('WM should hit callback endpoint shortly.');

    } catch (err) {
        console.error('error in order-and-redeem api', err)
        res.status(500).json({ error: 'Failed to order and redeem plan', intent });
    }

    await prisma.planOrder.updateMany({
        where: { intentId },
        data: { orderId: json.orderId }
    });

    // after testing - move update ref here!!!!!!!!

    
    return res.status(200).json({ intent });
}