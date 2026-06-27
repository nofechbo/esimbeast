// Clean, stable, keyword-first slugs for the programmatic-SEO channel.
//
//   /esim/{country}/{data}-{duration}
//   e.g. /esim/france/10gb-30-days   /esim/europe/unlimited-7-days
//
// Rules (see docs/seo-slugs.md):
//   - country segment comes from a STABLE iso->slug map, never the supplier name
//   - one canonical page per (country, data, duration) bucket; bucketKey groups them
//   - slugs are generated once and stored; they do not change when a plan's
//     name/price/data is edited (that would churn URLs and lose rankings)

import { getCountryName } from "../utils/homepage/codeToCountry.js";

const BASE = "esim";

// Multi-country coverage -> a single region slug. Detected from the set of
// country codes (longest/most-specific match wins). Single-country plans skip
// this and use the country name directly.
const REGIONS = [
  { slug: "europe", any: ["FR", "DE", "ES", "IT", "NL", "BE", "AT", "PL", "PT", "SE", "DK", "FI", "IE", "GR", "CZ"], min: 8 },
  { slug: "gulf", any: ["SA", "AE", "QA", "KW", "OM", "BH"], min: 3 },
  { slug: "south-america", any: ["BR", "AR", "CL", "PE", "EC", "UY"], min: 3 },
  { slug: "north-america", any: ["US", "CA", "MX", "PA", "CR", "SV"], min: 3 },
  { slug: "africa", any: ["DZ", "TN", "EG", "ZA", "GH", "MA"], min: 3 },
  { slug: "southeast-asia", any: ["SG", "MY", "TH", "ID", "VN", "PH", "KH", "LA"], min: 3 },
  { slug: "asia", any: ["JP", "KR", "CN", "HK", "TW", "SG", "MY", "TH", "ID", "VN", "PH"], min: 6 },
];

export function slugifyPart(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable country/region slug from a plan's countryCodes. */
export function countrySlug(countryCodes = []) {
  const codes = (countryCodes || []).map((c) => String(c).toUpperCase());
  if (codes.length === 1) {
    const name = getCountryName(codes[0]);
    return slugifyPart(name || codes[0]);
  }
  if (codes.length === 0) return "global";
  const set = new Set(codes);
  // most-specific region whose threshold is met
  let best = null;
  for (const r of REGIONS) {
    const hits = r.any.filter((c) => set.has(c)).length;
    if (hits >= r.min && (!best || hits > best.hits)) best = { slug: r.slug, hits };
  }
  if (best) return best.slug;
  if (codes.length >= 12) return "global";
  // small explicit combo: join the country names ("japan-korea")
  return codes.slice(0, 3).map((c) => slugifyPart(getCountryName(c) || c)).join("-");
}

/** Data segment: "unlimited" | "10gb" | "500mb" | "1gb-day" | "500mb-day". */
export function dataSlug(plan) {
  const gb = Number(plan.data);
  const daily = plan.dailyDataCap && String(plan.dailyDataCap).trim();
  if (daily) {
    const dn = Number(daily);
    if (Number.isFinite(dn) && dn > 0) return `${amountStr(dn)}-day`;
    if (gb > 0) return `${amountStr(gb)}-day`; // e.g. dailyCap "max"
    return `${slugifyPart(daily)}-day`;
  }
  if (!gb || gb === 0) return "unlimited";
  return amountStr(gb);
}

function amountStr(gb) {
  return gb < 1 ? `${Math.round(gb * 1000)}mb` : `${trimNum(gb)}gb`;
}

export function durationSlug(days) {
  const d = Number(days);
  return `${d}-${d === 1 ? "day" : "days"}`;
}

function trimNum(n) {
  return String(Number(n)).replace(/\.0+$/, "");
}

/** Groups SKUs that should share one canonical page. Supplier-agnostic. */
export function buildBucketKey(plan) {
  return [countrySlug(plan.countryCodes), dataSlug(plan), Number(plan.days)].join("|");
}

/** The public path, e.g. "/esim/france/10gb-30-days". */
export function buildSlug(plan) {
  return `${BASE}/${countrySlug(plan.countryCodes)}/${dataSlug(plan)}-${durationSlug(plan.days)}`;
}

/** Country hub path, e.g. "/esim/france". */
export function countryHubPath(countrySlugValue) {
  return `/${BASE}/${countrySlugValue}`;
}
