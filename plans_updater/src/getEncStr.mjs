import { createHash } from 'crypto';
import { config } from 'dotenv';

config({ path: ".env" });

const merchantId = process.env.TEST_MERCHANT_ID; //process.env.MERCHANT_ID;
const token = process.env.TEST_TOKEN; //process.env.TOKEN;

if (!merchantId || !token) {
  if (merchantId) {
    console.log("missing token in env");
  }
  if (token) {
    console.log("missing merchantid");
  }
  
  throw new Error('Missing MERCHANT_ID or TOKEN in .env file');
}

const encStr = createHash('sha1').update(merchantId + token).digest('hex');

console.log('SHA1 encStr:', encStr);