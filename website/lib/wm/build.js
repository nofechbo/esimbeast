// Build a Plan-shaped row from a WM catalog product, enriched with structured
// per-country coverage. Pricing: WM's productPrice is our wholesale COST in TWD
// (productcPrice is 0 for all) → convert TWD→USD and mark up (like EA's 2x).

import { countryToIso } from "./coverage.js";

// Overridable so the output can be re-priced without code changes.
export const TWD_USD = Number(process.env.WM_TWD_USD || 0.0314); // 1 TWD ≈ $0.0314 (USD/TWD ~31.9, Jun 2026)
// retail = wm_price_usd × markup. 2× uniformly across the catalog, matching EA
// (which sells at 2× its cost). NOTE: WM's productPrice ≈ esimbeast's CURRENT
// retail (calibrated 2026-06-28 vs live prices), so 2× roughly doubles today's WM
// prices — a deliberate margin choice. Env-overridable via WM_MARKUP.
export const WM_MARKUP = Number(process.env.WM_MARKUP || 2);

/**
 * Parse a WM productName like "Multi-region A, 10 Days, 1GB /day, 128kbps" or
 * "Africa A, 10 Days, Unlimited data /day" or "Taiwan, 30 Days, 1GB, 128kbps".
 * @returns {{days:number|null, dataGb:number|null, isDaily:boolean, isUnlimited:boolean, reducedKbps:number|null}}
 */
export function parseProductName(name) {
  const s = String(name || "");
  const days = (s.match(/(\d+)\s*days?/i) || [])[1];
  const isDaily = /\/\s*day|per\s*day/i.test(s);
  const isUnlimited = /unlimited/i.test(s);

  let dataGb = null;
  const vol = s.match(/(\d+(?:\.\d+)?)\s*(GB|MB)\b/i);
  if (vol) {
    const n = parseFloat(vol[1]);
    dataGb = vol[2].toUpperCase() === "MB" ? n / 1000 : n;
  }

  let reducedKbps = null;
  const sp = s.match(/(\d+(?:\.\d+)?)\s*(kbps|mbps)/i);
  if (sp) reducedKbps = Math.round(parseFloat(sp[1]) * (sp[2].toLowerCase() === "mbps" ? 1000 : 1));

  return {
    days: days ? parseInt(days, 10) : null,
    dataGb: isUnlimited ? 0 : dataGb, // 0 = unlimited (matches existing convention)
    isDaily,
    isUnlimited,
    reducedKbps,
  };
}

/** WM wholesale cost (TWD) → USD cents, and the marked-up retail in cents. */
export function priceCents(productPriceTwd) {
  const costCents = Math.round((Number(productPriceTwd) || 0) * TWD_USD * 100);
  return { costCents, retailCents: Math.round(costCents * WM_MARKUP) };
}

function slug(text) {
  return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * @param {object} product  a WM catalog product (leSIM)
 * @param {object|null} match buildMatcher() result { family } or null
 * @returns {object|null} a Plan-shaped row, or null if it has no resolvable countries
 */
export function buildWmPlan(product, match) {
  const parsed = parseProductName(product.productName);
  const fam = match?.family || null;

  // Countries: matched family first; else fall back to the name-prefix country
  // (492/493 unmatched are single-country like "Singapore").
  let countryCodes = fam?.countryCodes?.length ? fam.countryCodes : [];
  if (!countryCodes.length) {
    const prefixIso = countryToIso((product.productName || "").split(",")[0].trim());
    if (prefixIso) countryCodes = [prefixIso];
  }
  if (!countryCodes.length) return null; // no coverage → can't sell it

  const { costCents, retailCents } = priceCents(product.productPrice);
  if (retailCents <= 0) return null;

  const isUnlimited = parsed.isUnlimited || parsed.dataGb === 0;
  const dataGb = isUnlimited ? 0 : parsed.dataGb ?? 0;
  const fup = isUnlimited ? "Unlimited" : parsed.dataGb != null
    ? (parsed.dataGb < 1 ? `${Math.round(parsed.dataGb * 1000)} MB` : `${parsed.dataGb} GB`)
    : "";

  const coverage = fam
    ? {
        byCountry: fam.byCountry,
        network: fam.network,
        apn: fam.apn,
        roaming: fam.roaming,
        notes: fam.notes,
        reset: fam.reset,
        family: fam.name,
      }
    : null;

  const networks = fam
    ? [...new Set(fam.byCountry.flatMap((c) => c.operators || []))].slice(0, 12)
    : [];

  return {
    productId: product.wmproductId,
    code: product.productId || product.wmproductId,
    name: (product.productName || "").trim(),
    days: parsed.days ?? 0,
    limited: !isUnlimited,
    fup,
    data: dataGb, // GB; 0 = unlimited
    dailyDataCap: parsed.isDaily ? (isUnlimited ? "Unlimited/day" : fup + "/day") : null,
    reducedSpeed: parsed.reducedKbps,
    price: retailCents,
    supplierPrice: costCents,
    reloadable: false, // WM has no top-up
    countryCodes,
    networks,
    networkSpeed: fam?.network ?? null,
    apn: fam?.apn ?? null,
    hotspot: null,
    activation: null,
    delivery: null,
    seoText: null,
    planType: parsed.isDaily ? "Daily Limit" : "Data in Total",
    localNumber: null,
    notification: [fam?.notes, fam?.reset].filter(Boolean).join(" — ") || null,
    eKYC: /kyc/i.test(product.productName || "") || /kyc/i.test(fam?.name || "") || null,
    uniqueName: slug(`WM-${product.wmproductId}-${product.productName}`),
    isPopular: false,
    isCapped: !parsed.isDaily, // total-data = capped; daily plans are not
    hasPhone: fam?.hasPhone ?? false,
    coverage,
    supplier: "WM",
  };
}
