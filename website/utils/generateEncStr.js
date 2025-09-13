import { createHash } from 'crypto';

export function generateEncStr({ merchantId, deptId, qrcodeType, prodList }, token) {
    if (!merchantId || !deptId || qrcodeType == null || !Array.isArray(prodList) || prodList.length === 0) {
        throw new Error('Missing required fields for encStr');
    }
    
    const fields = [
        merchantId,
        deptId,
        String(qrcodeType),
        ...prodList.flatMap(p => [p.wmproductId, String(p.qty)])
    ].map(v => String(v).trim());
    
    
    const concatenated = fields.join('') + String(token).trim();
    return createHash('sha1').update(concatenated).digest('hex');
}
