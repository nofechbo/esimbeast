#!/usr/bin/env node

import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/db/prisma.js";

const PREFERRED_COLUMN_ORDER = [
  "id",
  "productId",
  "code",
  "name",
  "days",
  "limited",
  "fup",
  "data",
  "dailyDataCap",
  "reducedSpeed",
  "price",
  "reloadable",
  "countryCodes",
  "networks",
  "networkSpeed",
  "apn",
  "hotspot",
  "activation",
  "delivery",
  "seoText",
  "planType",
  "localNumber",
  "eKYC",
  "uniqueName",
  "isPopular",
];

function parseArgs(argv) {
  const outFlagIndex = argv.indexOf("--out");

  if (outFlagIndex === -1) {
    return {};
  }

  const outPath = argv[outFlagIndex + 1];
  if (!outPath) {
    throw new Error("Missing value for --out");
  }

  return { outPath };
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:]/g, "-").replace(/\..+/, "");
}

function serializeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === "object" && typeof value.toString === "function") {
    return value.toString();
  }

  return String(value);
}

function escapeCsvCell(value) {
  const serialized = serializeValue(value);
  return `"${serialized.replace(/"/g, '""')}"`;
}

function resolveColumns(rows) {
  const discoveredColumns = new Set();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      discoveredColumns.add(key);
    }
  }

  const orderedKnownColumns = PREFERRED_COLUMN_ORDER.filter((column) =>
    discoveredColumns.has(column)
  );

  const extraColumns = [...discoveredColumns].filter(
    (column) => !PREFERRED_COLUMN_ORDER.includes(column)
  );

  return [...orderedKnownColumns, ...extraColumns];
}

function buildCsv(rows, columns) {
  const header = columns.map(escapeCsvCell).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvCell(row[column])).join(",")
  );

  return `${header}\n${lines.join("\n")}\n`;
}

async function main() {
  const { outPath } = parseArgs(process.argv.slice(2));
  const defaultFilename = `plans-export-${formatTimestamp()}.csv`;
  const resolvedOutputPath = outPath
    ? path.resolve(process.cwd(), outPath)
    : path.resolve(process.cwd(), "exports", defaultFilename);

  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });

  const plans = await prisma.plan.findMany({
    orderBy: { id: "asc" },
  });

  const columns = resolveColumns(plans);
  const csv = buildCsv(plans, columns);
  await writeFile(resolvedOutputPath, csv, "utf8");

  console.log(
    `Exported ${plans.length} plans with ${columns.length} columns to ${resolvedOutputPath}`
  );
}

main()
  .catch((error) => {
    console.error(`Export failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
