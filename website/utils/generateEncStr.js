import { createHash } from 'crypto';

/**
 * Generates the SHA1 `encStr` expected by Worldmove APIs.
 *
 * @param {string[]} fields - All relevant fields in exact concat order (as strings).
 * @param {string} token - The token provided by Worldmove.
 * @returns {string} encStr - The SHA1 hex digest.
**/

export function generateEncStr(fields, token) {
    const concatenated = fields.map(String).join('') + token;
    return createHash('sha1').update(concatenated).digest('hex');
}
