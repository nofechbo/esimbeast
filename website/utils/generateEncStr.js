import { createHash } from 'crypto';

export function generateEncStr(data, token) {
    let fields = []

    if ('rcode' in data) {
        if (!data.merchantId || !data.rcode) throw new Error('Missing required fields for status encStr generation');
        fields = [data.merchantId, data.rcode]

    } else if ('prodList' in data) {
        if (!data.merchantId || !data.deptId || !data.qrcodeType || !Array.isArray(data.prodList) || data.prodList.length === 0) {
            throw new Error('Missing required fields for order encStr generation');
        }
        fields = [
            data.merchantId,
            data.deptId,
            String(data.qrcodeType),
            ...data.prodList.flatMap(p => [p.wmproductId, String(p.qty)])
        ]
    } else {
        throw new Error('Invalid data for encStr generation');
    }

    const concatenated = fields.map(v => String(v).trim()).join('') + String(token).trim();
    
    return createHash('sha1').update(concatenated).digest('hex');
}