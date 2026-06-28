#!/usr/bin/env node
// Seed the programmatic-SEO intent layer: {destination} x {origin} pages, e.g.
// "eSIM Morocco from the UK". Idempotent (upsert). Re-run after syncPlans so the
// price-from / data-options in the copy stay fresh.
//
//   DATABASE_URL=... node scripts/seedLandingPages.js
import "dotenv/config";
import { prisma } from "../lib/db/prisma.js";
import { getPlansByCountrySlug } from "../lib/db/plans.js";
import { generateOriginPage } from "../lib/landing/generate.js";

// High-value destinations (slug must match countrySlug used for the hubs).
const DESTINATIONS = [
  ["morocco", "Morocco"],
  ["france", "France"],
  ["spain", "Spain"],
  ["italy", "Italy"],
  ["turkey", "Turkey"],
  ["japan", "Japan"],
  ["thailand", "Thailand"],
  ["united-states", "United States"],
  ["united-arab-emirates", "United Arab Emirates"],
  ["greece", "Greece"],
  ["portugal", "Portugal"],
  ["vietnam", "Vietnam"],
  ["indonesia", "Indonesia"],
  ["egypt", "Egypt"],
  ["europe", "Europe"],
];
const ORIGIN_KEYS = ["uk", "us"];

function statsFor(plans) {
  if (!plans.length) return null;
  return {
    fromCents: Math.min(...plans.map((p) => p.price)),
    count: plans.length,
    dataOptions: [...new Set(plans.map((p) => Number(p.data)).filter((d) => d > 0))].sort((a, b) => a - b),
    dayOptions: [...new Set(plans.map((p) => p.days))].sort((a, b) => a - b),
  };
}

async function main() {
  let created = 0;
  let skipped = 0;
  for (const [destSlug, destName] of DESTINATIONS) {
    const plans = await getPlansByCountrySlug(destSlug);
    const stats = statsFor(plans);
    if (!stats) {
      console.warn(`skip ${destSlug}: no plans found for that hub`);
      skipped++;
      continue;
    }
    for (const origin of ORIGIN_KEYS) {
      const c = generateOriginPage(destName, stats, origin);
      const slug = `esim/${destSlug}/from-${origin}`;
      await prisma.landingPage.upsert({
        where: { destination_kind_modifier: { destination: destSlug, kind: "origin", modifier: origin } },
        update: { slug, title: c.title, metaDescription: c.metaDescription, intro: c.intro, body: c.body, faq: c.faq },
        create: { slug, kind: "origin", destination: destSlug, modifier: origin, title: c.title, metaDescription: c.metaDescription, intro: c.intro, body: c.body, faq: c.faq },
      });
      created++;
    }
  }
  console.log(`Seeded/updated ${created} intent pages (${skipped} destinations skipped — no plans).`);
}

main()
  .catch((e) => {
    console.error("seed failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
