function setCookie(key, value, days) {
  const expires = `expires=${new Date(Date.now() + days * 864e5).toUTCString()}` // 864e5 = 864 * 10^5 = 86400000 = milliseconds in 1 day
  document.cookie = `${key}=${value}; ${expires}; path=/`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? match[2] : null;
}

export function handleReferral(router) {
  if (!router || !router.isReady) return;

  const { ref } = router.query;
  if (!ref) return;

  const existing = getCookie("ref");

  if (existing !== ref) {
    setCookie("ref", ref, 30);
  }
}

export function clearReferralCookie() {
  document.cookie = `ref=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}


