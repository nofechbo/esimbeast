// Google Analytics 4 (gtag) helper. No-op until NEXT_PUBLIC_GA_ID is set,
// so the site runs identically with or without analytics configured.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const enabled = () =>
  typeof window !== "undefined" && !!GA_ID && typeof window.gtag === "function";

/** Record a SPA pageview (pages-router navigations don't reload the page). */
export function pageview(url) {
  if (!enabled()) return;
  window.gtag("config", GA_ID, { page_path: url });
}

/** Record a custom event, e.g. event("purchase", { value, currency, items }). */
export function event(action, params = {}) {
  if (!enabled()) return;
  window.gtag("event", action, params);
}
