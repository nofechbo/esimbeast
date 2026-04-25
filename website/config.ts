export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || '(Site Name)';
export const SITE_EMAIL = process.env.NEXT_PUBLIC_SITE_EMAIL || '(Site Email)';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimbeast.com';
export const HEADER_LOGO = process.env.NEXT_PUBLIC_HEADER_LOGO || '/base_logo.svg';
export const FOOTER_LOGO = process.env.NEXT_PUBLIC_FOOTER_LOGO || '/footer_logo.svg';
export const SKIP_EMAIL_SENDING = process.env.NEXT_PUBLIC_SKIP_EMAIL_SENDING === 'true';
export const MAX_STATIC_PATHS = parseInt(process.env.MAX_STATIC_PATHS) || 100;

// Worldmove API
export const WM_ORDER_AND_REDEEM_URL = process.env.WM_ORDER_AND_REDEEM_URL;
export const WM_USAGE_QUERY_URL = process.env.WM_USAGE_QUERY_URL;
export const WM_MERCHANT_ID = process.env.WM_MERCHANT_ID;
export const WM_TOKEN = process.env.WM_TOKEN;
export const WM_DEPT_ID = process.env.WM_DEPT_ID;

// EsimAccess API
export const ESIMACCESS_ACCESS_CODE = process.env.ESIMACCESS_ACCESS_CODE;