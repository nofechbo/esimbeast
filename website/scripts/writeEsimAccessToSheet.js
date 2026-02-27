#!/usr/bin/env node

import { google } from "googleapis";
import { fetchEsimAccessPackages } from "../lib/plans/fetchEsimAccessPackages.js";
import dotenv from "dotenv";
dotenv.config();

const KEY_COL = "B"; // B - used as the unique key for matching rows
const KEY_COL_INDEX = KEY_COL.charCodeAt(0) - "A".charCodeAt(0);
const LAST_COL = "I";
const LAST_COL_INDEX = LAST_COL.charCodeAt(0) - "A".charCodeAt(0);

// API price is value * 10,000 (10000 = $1.00)
function formatEAPrice(apiPrice) {
  return (apiPrice / 100).toFixed(2);
}

function bytesToDataString(bytes) {
  if (!bytes) return "";
  if (bytes === 0) return "Unlimited";
  const kb = bytes / 1024;
  if (kb < 1000) {
    return `${parseFloat(kb.toFixed(4))} KB`;
  }
  const mb = kb / 1024;
  if (mb < 1000) {
    return `${parseFloat(mb.toFixed(4))} MB`;
  }
  const gb = mb / 1024;
  return `${parseFloat(gb.toFixed(4))} GB`;
}
///// WE WANT TO JUST WRITE ALL FIELDS RETURNED BY API AS IS.
function packageToRow(pkg) {
  return [
    pkg.packageCode, // A: productId
    pkg.slug, // B: Code (key)
    pkg.name, // C: plan name
    pkg.duration, // D: Days
    bytesToDataString(pkg.volume), // E: GB
    pkg.resolvedCountryCodes.join(","), // F: Country code
    pkg.network || "", // G: Networks
    pkg.supportTopUpType > 0 ? "yes" : "no", // H: Reloadable
    formatEAPrice(pkg.price), // I: EA Price
  ];
}

async function writeEsimAccessToSheet() {
  console.log("Fetching eSIM Access packages...");
  const packages = await fetchEsimAccessPackages();
  console.log(`Fetched ${packages.length} packages from API`);

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = process.env.DB_SHEET_ID;
  const tab = process.env.DB_SHEET_EA_TAB;

  // 1. Read existing sheet data
  const existingResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tab,
  });
  const existingRows = existingResponse.data.values || [];

  // 2. Build slug → array index map (index 0 = header row, data starts at 1)
  const slugToArrayIndex = new Map();
  for (let i = 1; i < existingRows.length; i++) {
    const slug = existingRows[i][KEY_COL_INDEX];
    if (slug) slugToArrayIndex.set(slug, i);
  }

  // 3. Split into updates (existing rows) and inserts (new rows)
  const apiSlugs = new Set(packages.map((p) => p.slug));
  const updateData = [];
  const newRows = [];
  let updatedCount = 0;

  for (const pkg of packages) {
    const row = packageToRow(pkg);
    const arrayIndex = slugToArrayIndex.get(pkg.slug);

    if (arrayIndex !== undefined) {
      const sheetRow = arrayIndex + 1; // 0-based array → 1-based sheet row
      // Update all columns except Price
      updateData.push({
        range: `${tab}!A${sheetRow}:${LAST_COL}${sheetRow}`,
        values: [row.slice(0, LAST_COL_INDEX + 1)],
      });
      updatedCount++;
    } else {
      newRows.push(row);
    }
  }

  // 4. Batch update existing rows
  if (updateData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "USER_ENTERED", data: updateData },
    });
    console.log(`Updated ${updatedCount} existing rows`);
  }

  // 5. Append new rows
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: newRows },
    });
    console.log(`Appended ${newRows.length} new rows`);
  }

  // 6. Delete rows for packages no longer in API
  const rowsToDelete = [];
  for (const [slug, arrayIndex] of slugToArrayIndex.entries()) {
    if (!apiSlugs.has(slug)) rowsToDelete.push(arrayIndex);
  }

  if (rowsToDelete.length > 0) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetMeta = spreadsheet.data.sheets.find(
      (s) => s.properties.title === tab,
    );
    const sheetId = sheetMeta.properties.sheetId;

    // Delete bottom-to-top so indices don't shift during deletion
    rowsToDelete.sort((a, b) => b - a);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: rowsToDelete.map((arrayIndex) => ({
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: arrayIndex,
              endIndex: arrayIndex + 1,
            },
          },
        })),
      },
    });
    console.log(`Deleted ${rowsToDelete.length} rows no longer in API`);
  }

  console.log("Sheet sync complete.");
}

async function main() {
  try {
    await writeEsimAccessToSheet();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
