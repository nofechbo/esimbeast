/**
 * Scrape esimdb.com for the cheapest competitor price per eSIMdb-eligible EA plan
 * (10/20GB ≤30d), into CompetitorPrice — the input to scripts/esimdb/reprice.js.
 *
 *   node scripts/esimdb/scrape.js --country=usa          # probe one country, no DB
 *   DATABASE_URL=… node scripts/esimdb/scrape.js --dry    # all EA-eligible countries, preview
 *   DATABASE_URL=… node scripts/esimdb/scrape.js          # write CompetitorPrice
 *
 * ⚠️ Parses esimdb's server-rendered Nuxt state — fragile to site changes, and
 * scraping is ToS-sensitive. Validate output; run sparingly.
 */
import lookup from "country-code-lookup";
import { parseEsimdbPlans, cheapestUsdCents } from "../../lib/esimdb/scrape.js";
import { isEsimdbProduct, ESIMDB_SIZES_GB, ESIMDB_MAX_DAYS } from "../../lib/esimdb/eligible.js";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")));
const UA = { "User-Agent": "Mozilla/5.0 Chrome/120 Safari/537.36" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// EA ISO code → esimdb country-page slug. Derived from the country name with a
// few overrides for esimdb's actual paths.
const SLUG_OVERRIDE = { US: "usa", GB: "uk", AE: "united-arab-emirates", KR: "south-korea", KP: null, RU: "russia" };
function esimdbSlug(iso) {
  if (iso in SLUG_OVERRIDE) return SLUG_OVERRIDE[iso];
  try {
    return lookup.byIso(iso)?.country?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || null;
  } catch {
    return null;
  }
}

async function cheapestForCountry(slug) {
  const res = await fetch(`https://esimdb.com/${slug}`, { headers: UA });
  if (!res.ok) return null;
  const plans = parseEsimdbPlans(await res.text());
  const out = {};
  for (const gb of ESIMDB_SIZES_GB) out[gb] = cheapestUsdCents(plans, gb, ESIMDB_MAX_DAYS);
  return out;
}

async function main() {
  // probe mode — no DB, just print one country
  if (args.country) {
    const r = await cheapestForCountry(args.country);
    console.log(args.country, JSON.stringify(r));
    return;
  }

  const { prisma } = await import("../../lib/db/prisma.js");
  const eaPlans = (await prisma.plan.findMany({ where: { supplier: "EA" } })).filter(isEsimdbProduct);
  // group by single country (eSIMdb plans are country-priced)
  const byCountry = new Map();
  for (const p of eaPlans) {
    const iso = p.countryCodes?.[0];
    if (!iso) continue;
    if (!byCountry.has(iso)) byCountry.set(iso, []);
    byCountry.get(iso).push(p);
  }
  console.log(`${eaPlans.length} EA-eligible plans across ${byCountry.size} countries.`);

  let wrote = 0, noData = 0;
  for (const [iso, plans] of byCountry) {
    const slug = esimdbSlug(iso);
    if (!slug) { noData++; continue; }
    let cheapest;
    try { cheapest = await cheapestForCountry(slug); } catch { cheapest = null; }
    await sleep(800); // be gentle
    if (!cheapest) { noData++; continue; }
    for (const p of plans) {
      const gb = Math.round(Number(p.data));
      const c = cheapest[gb];
      if (!c) continue;
      if (args.dry !== undefined) {
        console.log(`  ${iso} ${gb}GB → competitor $${(c.priceCents / 100).toFixed(2)} (${p.uniqueName})`);
      } else {
        await prisma.competitorPrice.upsert({
          where: { planId: p.id },
          update: { competitorCents: c.priceCents, competitor: c.name, source: "esimdb", scrapedAt: new Date() },
          create: { planId: p.id, competitorCents: c.priceCents, competitor: c.name, source: "esimdb" },
        });
      }
      wrote++;
    }
  }
  console.log(`${args.dry !== undefined ? "[dry] " : ""}competitor prices for ${wrote} plans; ${noData} countries had no slug/data.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
