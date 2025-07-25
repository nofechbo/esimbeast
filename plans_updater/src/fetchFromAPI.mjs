import { config } from 'dotenv';
import https from 'https'; //for testing env
import fetch from 'node-fetch'; //for testing env

config({ path: ".env" });

export async function fetchFromAPI() {
    const merchantId = process.env.TEST_MERCHANT_ID; //process.env.MERCHANT_ID;
    const encStr = process.env.TEST_ENCSTR_QUERY_ALL; //process.env.ENCSTR_QUERY_ALL;

    if (!merchantId || !encStr) {
    throw new Error('Missing key information in .env file');
    }

    //for using the test env only:
    const agent = new https.Agent({ rejectUnauthorized: false }); // <-- disable TLS check for test

    try {
        const response = await fetch(`https://tfmshippingsys.fastmove.com.tw/Api/QuoteMg/myQueryAll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merchantId, encStr }),
            agent //for test env only.
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data?.msg || data?.error || `HTTP error ${response.status}`);
        }
        return data;

    } catch (err) {
        console.log('FULL ERROR:', err);
        throw new Error('failure fetching plans from Worldmove: ' + String(err));
    }


}