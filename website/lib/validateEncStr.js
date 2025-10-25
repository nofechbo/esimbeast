import crypto from 'crypto';

export function validateEncStr(callbackData) {
    const { orderId, itemList, encStr } = callbackData
    const merchantId = process.env.MERCHANT_ID
    const token = process.env.TOKEN

    if (!orderId || !itemList || !encStr) {
        console.error("Missing required fields in callback data")
        return false
    }

    let rawString = `${merchantId}${orderId}`;

    for (const item of itemList) {
        rawString +=
            item.iccid +
            item.productName +
            item.rcode +
            item.qrcodeType +
            item.qrcode
    }
    rawString += token

    const computed = crypto.createHash('sha1').update(rawString).digest('hex')
    return computed === encStr
}