// Match a WM catalog product to one of the parsed coverage families, so each
// imported plan can carry structured per-country coverage. The join is fuzzy:
// product names ("Europe B, 10 Days, 1GB /day") vs family names ("BICS Europe",
// "Mainland China A") — so we score by normalized token overlap, requiring any
// A/B/C/D/E variant letter to agree, and prefer a region/name match.

const STOP = new Set([
  "worldmove", "plus", "days", "day", "gb", "mb", "kbps", "mbps", "unlimited",
  "total", "per", "exp", "premium", "data", "esim", "multi", "region",
]);

export function normTokens(s) {
  if (!s) return [];
  return String(s)
    .replace(/【[^】]*】/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿 ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t) && !/^\d+$/.test(t));
}

// variant letter (A/B/C/D/E) appearing as a standalone token
function variant(tokens) {
  return tokens.find((t) => /^[a-e]$/.test(t)) || null;
}

/**
 * Build a matcher over parsed coverage families (output of parseCoverageFamily).
 * Returns matchProduct(product) -> { family, score } | null.
 */
export function buildMatcher(parsedFamilies) {
  const index = parsedFamilies.map((f) => {
    const toks = new Set(normTokens(f.name));
    return { family: f, toks, variant: variant([...toks]) };
  });

  return function matchProduct(product) {
    const prefix = (product.productName || "").split(",")[0];
    const pToks = normTokens(`${prefix} ${product.productRegion || ""}`);
    const pSet = new Set(pToks);
    const pVar = variant(pToks);

    let best = null;
    for (const entry of index) {
      // a declared variant letter must agree (Europe B != Europe C)
      if (pVar && entry.variant && pVar !== entry.variant) continue;
      let overlap = 0;
      for (const t of entry.toks) if (pSet.has(t)) overlap++;
      if (!overlap) continue;
      // Jaccard (intersection / union): a 1-country product prefers the 1-country
      // family over a multi-country family that merely contains that country name.
      const union = pSet.size + entry.toks.size - overlap;
      const score = overlap / Math.max(1, union);
      const bonus = pVar && entry.variant && pVar === entry.variant ? 0.25 : 0;
      const total = score + bonus;
      if (!best || total > best.score) best = { family: entry.family, score: total };
    }
    // require a minimum confidence
    return best && best.score >= 0.34 ? best : null;
  };
}
