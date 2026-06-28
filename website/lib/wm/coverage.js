// Parse Worldmove (WM) after-sales coverage families into structured per-country
// coverage — the data behind "suppliers for multi": for a regional plan, which
// operator(s) serve each country, plus APN / network / notes / phone.
//
// A coverage family (from the WM after-sales export) looks like:
//   {
//     plan: "【Worldmove】BICS 歐洲\nBICS Europe",
//     carriers: ["奧地利（Austria） A1 Telekom/Three", "法國（France） Orange/SFR", ...],
//     network: ["5G/4G"], apn: ["mobile"], roaming: ["CSL"],
//     coverage: "...", notes: "...", reset: "..."
//   }
// Each carrier string is "<中文>（<English country>） <Op1> / <Op2>" (full- or
// half-width parens). We extract the English country, map it to an ISO code, and
// split the operators.

import lookup from "country-code-lookup";

// English-name aliases for countries country-code-lookup doesn't match directly.
const COUNTRY_ALIASES = {
  "mainland china": "China",
  mainlandchina: "China",
  china: "China",
  macao: "Macau",
  macau: "Macau",
  "hong kong": "Hong Kong",
  hongkong: "Hong Kong",
  korea: "South Korea",
  "south korea": "South Korea",
  "czech republic": "Czechia",
  "united states": "United States",
  usa: "United States",
  america: "United States",
  uae: "United Arab Emirates",
  uk: "United Kingdom",
  russia: "Russia",
  vietnam: "Vietnam",
  laos: "Laos",
  macedonia: "North Macedonia",
  "ivory coast": "Côte d'Ivoire",
  "french guiana": "French Guiana",
  "french reunion": "Réunion",
  reunion: "Réunion",
};

/** Map an English country name to an ISO-3166 alpha-2 code, or null. */
export function countryToIso(name) {
  if (!name) return null;
  const clean = name.trim();
  const aliased = COUNTRY_ALIASES[clean.toLowerCase()] ?? clean;
  try {
    return lookup.byCountry(aliased)?.iso2 ?? null;
  } catch {
    return null;
  }
}

/**
 * Parse one carrier line into { country, countryCode, operators[] }.
 * "奧地利（Austria） A1 Telekom / Three" -> { country:"Austria", countryCode:"AT",
 *   operators:["A1 Telekom","Three"] }
 */
export function parseCarrier(line) {
  if (!line || typeof line !== "string") return null;
  // English country sits inside full-width （ ） or half-width ( ); operators follow.
  const m = line.match(/[（(]\s*([^（）()]+?)\s*[）)]\s*(.*)$/);
  let country, rest;
  if (m) {
    country = m[1].trim();
    rest = m[2].trim();
  } else {
    // No parens: "台灣 Taiwan Chunghwa Telecom" style — best-effort: last ASCII run
    // before operators is unreliable, so keep the whole line as the operator blob.
    country = line.replace(/[一-鿿]/g, "").trim().split(/\s{2,}/)[0] || null;
    rest = line;
  }
  const operators = rest
    .split(/\s*[/,，、]\s*/)
    .map((o) => o.replace(/[一-鿿]/g, "").trim()) // drop trailing Chinese
    .map((o) => o.trim())
    .filter(Boolean);
  return {
    country,
    countryCode: countryToIso(country),
    operators: operators.length ? operators : null,
  };
}

const PHONE_RE = /phone|call|voice|sms|語音|通話|簡訊|電話/i;

/**
 * Turn a raw coverage family into structured coverage.
 * @returns {{
 *   name:string, countryCodes:string[],
 *   byCountry: Array<{country,countryCode,operators}>,
 *   network:string|null, apn:string|null, roaming:string|null,
 *   notes:string|null, reset:string|null, hasPhone:boolean, isMulti:boolean
 * }}
 */
export function parseCoverageFamily(fam) {
  const carriers = (fam.carriers || []).map(parseCarrier).filter(Boolean);
  const countryCodes = [
    ...new Set(carriers.map((c) => c.countryCode).filter(Boolean)),
  ];
  const blob = JSON.stringify(fam);
  return {
    name: (fam.plan || "").split("\n").map((s) => s.trim()).filter(Boolean).pop() || fam.plan,
    countryCodes,
    byCountry: carriers,
    network: joinArr(fam.network),
    apn: joinArr(fam.apn),
    roaming: joinArr(fam.roaming),
    notes: (fam.notes || "").trim() || null,
    reset: (fam.reset || "").replace(/\s+/g, " ").trim() || null,
    hasPhone: PHONE_RE.test(blob),
    isMulti: carriers.length > 1,
  };
}

function joinArr(a) {
  if (!a) return null;
  const v = (Array.isArray(a) ? a : [a]).map((x) => String(x).trim()).filter(Boolean);
  return v.length ? [...new Set(v)].join(", ") : null;
}
