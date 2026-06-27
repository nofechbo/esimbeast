#!/usr/bin/env node
// Snapshot the Redirect table into a static JSON the edge middleware can read
// without a DB round-trip. Run at build time (prebuild) and after backfill.
//
//   DATABASE_URL=... node scripts/exportRedirects.js
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/db/prisma.js";

async function main() {
  const rows = await prisma.redirect.findMany({
    select: { fromPath: true, toPath: true, status: true },
  });
  const map = {};
  for (const r of rows) map[r.fromPath] = { to: r.toPath, status: r.status ?? 301 };
  const out = path.resolve(process.cwd(), "lib/redirects.generated.json");
  await writeFile(out, JSON.stringify(map), "utf8");
  console.log(`Exported ${rows.length} redirects -> ${out}`);
}

main()
  .catch((e) => {
    console.error("export failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
