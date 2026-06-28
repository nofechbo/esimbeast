// Content templates for the programmatic-SEO intent layer.
//
// The risk with {destination}x{origin} pages is thin/doorway content (Google
// penalizes "same page, swapped title"). So every page injects genuinely
// origin-specific facts (home carriers, real roaming cost, currency) AND
// destination-specific facts (price-from, data options) — no two pages read the
// same. Pure functions: pass stats in, get content out (no DB here).

export const ORIGINS = {
  uk: { label: "the UK", demonym: "UK", symbol: "£", carriers: ["EE", "Vodafone", "O2", "Three"], roamDay: "£6", roamNote: "UK networks reintroduced roaming charges outside the EU, so non-EU destinations are billed at daily-pass rates" },
  us: { label: "the US", demonym: "US", symbol: "$", carriers: ["AT&T", "Verizon", "T-Mobile"], roamDay: "$10", roamNote: "US carriers charge a daily international pass on top of your plan" },
  ca: { label: "Canada", demonym: "Canadian", symbol: "C$", carriers: ["Rogers", "Bell", "Telus"], roamDay: "C$12", roamNote: "Canadian roaming is among the most expensive in the world" },
  au: { label: "Australia", demonym: "Australian", symbol: "A$", carriers: ["Telstra", "Optus", "Vodafone AU"], roamDay: "A$10", roamNote: "Australian day-pass roaming adds up fast on longer trips" },
  ie: { label: "Ireland", demonym: "Irish", symbol: "€", carriers: ["Three", "Vodafone", "Eir"], roamDay: "€6", roamNote: "roaming charges apply again once you leave the EU zone" },
};

// "Intent" modifiers (no origin) — best/cheap/unlimited/5g.
export const INTENTS = {
  best: { adj: "best", title: (d) => `Best eSIM for ${d}`, angle: "ranked by price-per-GB, coverage and validity" },
  cheap: { adj: "cheapest", title: (d) => `Cheapest eSIM for ${d}`, angle: "the lowest-cost plans that still cover you" },
  unlimited: { adj: "unlimited-data", title: (d) => `Unlimited eSIM for ${d}`, angle: "high-data and unlimited daily plans" },
  "5g": { adj: "5G", title: (d) => `5G eSIM for ${d}`, angle: "plans on 5G/4G networks" },
};

function money(cents, symbol = "$") {
  if (cents == null) return null;
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

/**
 * @param {string} destinationName  e.g. "Morocco"
 * @param {object} stats { fromCents, count, dataOptions:number[], dayOptions:number[] }
 * @param {string} originKey  key of ORIGINS
 */
export function generateOriginPage(destinationName, stats, originKey) {
  const o = ORIGINS[originKey];
  if (!o) throw new Error(`unknown origin: ${originKey}`);
  const from = money(stats.fromCents) || "a few dollars";
  const dataList = (stats.dataOptions || []).slice(0, 4).join("GB / ") + (stats.dataOptions?.length ? "GB" : "");

  const title = `${destinationName} eSIM from ${o.label} — Skip Roaming Fees`;
  const metaDescription =
    `Travelling to ${destinationName} from ${o.label}? Get a ${destinationName} eSIM from ${from} ` +
    `and avoid ${o.carriers[0]} / ${o.carriers[1]} roaming (~${o.roamDay}/day). Instant QR delivery, no physical SIM.`;

  const intro =
    `Heading to ${destinationName} from ${o.label}? Instead of paying ${o.demonym} roaming — ${o.roamNote} — ` +
    `a ${destinationName} eSIM gets you local data the moment you land, from ${from}. ` +
    `Install it before you fly and skip the airport SIM queue.`;

  const body = [
    `## ${o.demonym} roaming vs a ${destinationName} eSIM`,
    `Keeping ${o.carriers[0]}, ${o.carriers[1]} or ${o.carriers[2]} on roaming in ${destinationName} typically costs around ${o.roamDay} per day. ` +
      `A ${destinationName} eSIM is a one-off purchase from ${from} for the whole trip — and your ${o.demonym} number stays active for calls and 2FA on your physical SIM.`,
    `## How it works`,
    `1. Pick a ${destinationName} data plan below. 2. Pay and receive a QR code by email in seconds. ` +
      `3. Scan it to install the eSIM (keep your ${o.demonym} SIM in too). 4. Turn on data roaming for the new line when you land.`,
    `## ${destinationName} plans for ${o.demonym} travellers`,
    stats.count
      ? `We currently offer ${stats.count} ${destinationName} plans${dataList ? ` (${dataList})` : ""}, starting at ${from}. Choose your data and validity below.`
      : `Browse the ${destinationName} plans below and choose your data and validity.`,
  ].join("\n\n");

  const faq = [
    {
      q: `Will my ${o.demonym} phone work with a ${destinationName} eSIM?`,
      a: `Yes, as long as it's eSIM-compatible and carrier-unlocked. Most phones sold in ${o.label} from the last few years support eSIM.`,
    },
    {
      q: `Do I keep my ${o.demonym} number?`,
      a: `Yes. The eSIM is a second line for data. Your physical ${o.demonym} SIM stays active for calls, texts and banking codes.`,
    },
    {
      q: `Is it cheaper than ${o.carriers[0]} roaming?`,
      a: `For almost any trip, yes. ${o.carriers[0]} roaming runs about ${o.roamDay}/day in ${destinationName}; a ${destinationName} eSIM is a single charge from ${from} for the whole stay.`,
    },
    {
      q: `When should I install it?`,
      a: `Install before you fly while you still have Wi-Fi, then simply enable data roaming for the ${destinationName} line after you land.`,
    },
  ];

  return { title, metaDescription, intro, body, faq };
}
