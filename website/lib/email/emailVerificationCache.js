import NodeCache from "node-cache";

if (!global.emailCache) {
  global.emailCache = new NodeCache({ 
    stdTTL: 15 * 60,  // 15 minutes (in seconds)
    checkperiod: 60   // clean up expired keys every 60s
  });
}

export const verificationCache = global.emailCache;
