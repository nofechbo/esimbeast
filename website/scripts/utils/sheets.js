import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
dotenv.config();

export async function fetchGoogleSheet(sheetId, sheetTabGid) {
  if (!sheetTabGid) {
    throw new Error("sheetTabGid is required");
  }

  console.log(`Fetching sheet data for tab gid "${sheetTabGid}"...`);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetTabGid}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(
      `Fatal error fetching tab gid ${sheetTabGid} from sheet: ${err.message}`,
    );
  }
  console.log(
    `Received response for tab gid "${sheetTabGid}": ${response.status} ${response.statusText}`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch tab gid ${sheetTabGid} from sheet: ${response.status} ${response.statusText}`,
    );
  }
  console.log(`Successfully fetched data for tab gid "${sheetTabGid}".`);
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
