import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
dotenv.config();

export async function fetchGoogleSheet(sheetId, sheetTab) {
  console.log(`Fetching sheet data for tab "${sheetTab}"...`);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetTab}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(
      `Fatal error fetching ${sheetTab} tab from sheet: ${err.message}`,
    );
  }
  console.log(
    `Received response for tab "${sheetTab}": ${response.status} ${response.statusText}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${sheetTab} tab from sheet: ${response.status} ${response.statusText}`,
    );
  }
  console.log(`Successfully fetched data for tab "${sheetTab}".`);
  return await response.text();
}

export function parseCsv(csvText) {
  console.log("Starting CSV parsing...");
  let records;
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw new Error(`Fatal error parsing CSV: ${err.message}`);
  }
  if (records.length === 0) {
    throw new Error(`CSV appears to be empty or malformed.`);
  }

  console.log(`Parsed ${records.length} records from CSV.`);

  // trimming keys, to remove trailing spaces from headers,
  // to avoid issues when accessing fields by name
  console.log("Trimming record keys...");
  records = records.map((row) => {
    const trimmed = {};
    for (const [key, val] of Object.entries(row)) {
      trimmed[key.trim()] = val;
    }
    return trimmed;
  });

  console.log("Parsing complete.");
  return records;
}