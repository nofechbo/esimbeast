import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
dotenv.config();

const parseCSV = (text) =>
  parse(text, { columns: true, skip_empty_lines: true, trim: true });

function normalizeHeaders(rows, mapCamelToCsv) {
  return rows.map((row) => {
    const normalized = {};
    for (const [camelKey, csvHeader] of Object.entries(mapCamelToCsv)) {
      normalized[camelKey] = row[csvHeader];
    }
    return normalized;
  });
}

function normalizeBooleanFields(rows, fields) {
  return rows.map((row) => {
    const normalized = { ...row };
    for (const key of fields) {
      const v = normalized[key];
      if (typeof v === "string") {
        const val = v.toLowerCase().trim();
        if (val === "yes" || val === "true") normalized[key] = true;
        else if (val === "no" || val === "false") normalized[key] = false;
      }
    }
    return normalized;
  });
}

export async function fetchAndParseSheetTab({
  sheetTab,
  headerMap,
  booleanFields = [],
  rowFilter = null,
  label = "sheet",
}) {
  const sheetId = process.env.DB_SHEET_ID;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetTab}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Fatal error fetching ${label} sheet: ${err.message}`);
  }
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${label} sheet: ${response.status} ${response.statusText}`
    );
  }

  let records;
  try {
    records = parseCSV(await response.text());
  } catch (err) {
    throw new Error(`Fatal error parsing ${label} sheet: ${err.message}`);
  }
  if (records.length === 0) {
    throw new Error(`${label} CSV appears to be empty or malformed.`);
  }

  // trim trailing spaces
  records = records.map((row) => {
    const trimmed = {};
    for (const [key, val] of Object.entries(row)) {
      trimmed[key.trim()] = val;
    }
    return trimmed;
  });

  if (rowFilter) records = records.filter(rowFilter);

  return normalizeBooleanFields(normalizeHeaders(records, headerMap), booleanFields);
}
