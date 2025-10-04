import crypto from 'crypto';

export function validateEncStr(callbackData) {
    const { orderId, itemList, encStr } = callbackData
    const merchantId = process.env.TEST_MERCHANT_ID
    const token = process.env.TEST_TOKEN

    if (!orderId || !itemList || !encStr) {
        console.error("Missing required fields in callback data")
        return false
    }

    let rawString = `${merchantId}${orderId}`;

    for (const item of itemList) {
        rawString +=
            item.ccid +
            item.productName +
            item.rcode +
            item.qrcode +
            item.qrcodeType
    }
    rawString += token

    const computed = crypto.createHash('sha1').update(rawString).digest('hex')
    return computed === encStr
}