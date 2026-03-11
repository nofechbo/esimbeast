import { google } from "googleapis";
import { fetchEsimAccessPackages } from "../lib/plans/fetchEsimAccessPackages.js";
import dotenv from "dotenv";
dotenv.config();

const KEY_FIELD = "packageCode"; // field used as unique key for matching rows
const CUSTOM_PRICE_HEADER = "Price"; // manually-maintained price column

const ALPHABET_SIZE = 26;
const CHAR_CODE_A = "A".charCodeAt(0);

// Converts 0-based column index to sheet letter (0 → "A", 26 → "AA", etc.)
function colIndexToLetter(index) {
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % ALPHABET_SIZE;
    letter = String.fromCharCode(CHAR_CODE_A + rem) + letter;
    n = Math.floor((n - 1) / ALPHABET_SIZE);
  }
  return letter;
}

function flattenFieldValue(field, val) {
  if (field === "locationNetworkList") {
    return val
      .flatMap((loc) => loc.operatorList ?? [])
      .map((op) => `${op.operatorName} ${op.networkType}`)
      .join(", ");
  }
  if (Array.isArray(val)) return val.join(",");
  return val ?? "";
}

function packageToRow(activeFields, pkg, customPrice = "") {
  const values = activeFields.map((field) => flattenFieldValue(field, pkg[field]));
  return [...values, customPrice];
}

async function writeEsimAccessToSheet() {
  console.log("Fetching eSIM Access packages...");
  const packages = await fetchEsimAccessPackages();
  console.log(`Fetched ${packages.length} packages from API`);

  if (packages.length === 0) {
    console.log("No packages returned, nothing to do.");
    return;
  }

  const apiFields = Object.keys(packages[0]);

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

  // 2. Derive active fields from sheet headers if they exist, otherwise from API.
  // Strip CUSTOM_PRICE_HEADER since it's our column, not an API field.
  // Sheet headers are the source of truth after first run — new API fields are ignored.
  const activeFields =
    existingRows.length > 0
      ? existingRows[0].filter((h) => h !== CUSTOM_PRICE_HEADER)
      : apiFields;

  const newApiFields = apiFields.filter((f) => !activeFields.includes(f));
  if (newApiFields.length > 0) {
    console.log(
      `Ignoring new API fields not in sheet: ${newApiFields.join(", ")}`,
    );
  }

  const headers = [...activeFields, CUSTOM_PRICE_HEADER];
  const keyColIndex = activeFields.indexOf(KEY_FIELD);
  if (keyColIndex === -1) {
    throw new Error(`Key field "${KEY_FIELD}" not found in sheet headers`);
  }
  const sheetPriceColIndex = headers.length - 1;
  const lastColLetter = colIndexToLetter(headers.length - 1);

  
  // 3. Build key → array index map (index 0 = header row, data starts at 1)
  const keyToArrayIndex = new Map();
  for (let i = 1; i < existingRows.length; i++) {
    const key = existingRows[i][keyColIndex];
    if (key) keyToArrayIndex.set(key, i);
  }

  // 4. Split packages into updates and inserts
  const apiKeys = new Set(packages.map((p) => p[KEY_FIELD]));
  const updateData = [];
  const newRows = [];

  for (const pkg of packages) {
    const key = pkg[KEY_FIELD];
    const arrayIndex = keyToArrayIndex.get(key);
    const customPrice =
      arrayIndex !== undefined
        ? (existingRows[arrayIndex][sheetPriceColIndex] ?? "")
        : "";
    const row = packageToRow(activeFields, pkg, customPrice);

    if (arrayIndex !== undefined) {
      const sheetRow = arrayIndex + 1; // 0-based array → 1-based sheet row
      updateData.push({
        range: `${tab}!A${sheetRow}:${lastColLetter}${sheetRow}`,
        values: [row],
      });
    } else {
      newRows.push(row);
    }
  }

  // 5. Batch update existing rows
  if (updateData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "USER_ENTERED", data: updateData },
    });
    console.log(`Updated ${updateData.length} existing rows`);
  }

  // 6. Append new rows
  // First run: prepend headers so they're written in the same call as the data
  if (existingRows.length === 0) {
    newRows.unshift(headers);
  }
  if (newRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: newRows },
    });
    console.log(`Appended ${newRows.length} new rows`);
  }

  // 7. Delete rows for packages no longer in API
  const rowsToDelete = [];
  for (const [key, arrayIndex] of keyToArrayIndex.entries()) {
    if (!apiKeys.has(key)) rowsToDelete.push(arrayIndex);
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
