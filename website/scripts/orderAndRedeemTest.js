import 'dotenv/config';
import https from 'https';
import fetch from 'node-fetch';
import { generateEncStr } from '../utils/generateEncStr.js';

const merchantId = process.env.TEST_MERCHANT_ID;
const deptId = process.env.TEST_DEPT_ID;
const token = process.env.TEST_TOKEN;

const wmproductId = 'WM_000003';
const qty = 2;
const qrcodeType = 2; // 0 or 2? store in db just the link or the LPA string as well (allows to recreate qr)

const encStr = generateEncStr(
    [merchantId, deptId, String(qrcodeType), wmproductId, String(qty)],
    token
);

const requestBody = {
    merchantId,
    deptId,
    qrcodeType,
    prodList: [{ wmproductId, qty }],
    encStr
};

const url = 'https://tfmshippingsys.fastmove.com.tw/Api/SOrder/mybuyesimRedemption';

// TLS-bypass agent (required for test environment)
const agent = new https.Agent({ rejectUnauthorized: false });

async function run() {
  try {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        agent // required to bypass TLS rejection in Worldmove test env
    });

    const json = await res.json();
    console.log('✅ Worldmove response:', json);

    if (json.code === 0) {
      console.log('🎯 Callback should hit your endpoint shortly.');
    } else {
      console.warn('❌ Worldmove rejected the request:', json);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

run();
