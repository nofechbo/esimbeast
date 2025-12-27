export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || '(Site Name)';
export const SITE_EMAIL = process.env.NEXT_PUBLIC_SITE_EMAIL || '(Site Email)';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimbeast.com';
export const HEADER_LOGO = process.env.NEXT_PUBLIC_HEADER_LOGO || '/base_logo.svg';
export const FOOTER_LOGO = process.env.NEXT_PUBLIC_FOOTER_LOGO || '/footer_logo.svg';
export const IS_RENDER = process.env.NEXT_PUBLIC_IS_RENDER === 'true';
export const MAX_STATIC_PATHS = parseInt(process.env.MAX_STATIC_PATHS) || 100;
