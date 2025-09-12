import { parse } from "csv-parse/sync";
import { planValues } from "@/utils/planHeaders";

// const sheetId = "19FMgoB6l9znMsI4F5fzW7zR8vxfej_5YLM7YTx1r3nw";
const sheetId = "1gYn3DuZLtY22EK2RN-iHaFOnxBU4lTQVh6Oe26O6jJg"; //test sheet
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

const parseCSV = (text) => {
    return parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
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

function normalizeHeaders(rows, mapCamelToCsv) {
    return rows.map((row) => {
        const out = {};
        for (const [camelKey, csvHeader] of Object.entries(mapCamelToCsv)) {
            out[camelKey] = row[csvHeader];
        }
        return out;
    });
}

export async function fetchAndParseCSV() {
    let records;
    let response;
    console.log("FETCHING@@@")
    try {
        response = await fetch(SHEET_URL);
    } catch (err) {
        throw new Error(`Fatal error fetching sheet: ${err.message}`);
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
    }

    try {
        const csvText = await response.text();
        records = parseCSV(csvText);
    } catch (err) {
        throw new Error(`Fatal error parsing sheet: ${err.message}`);
    }
    if (records.length === 0) {
        throw new Error("CSV appears to be empty or malformed.");
    }

    const normalized = normalizeHeaders(records, planValues);
    const booleanFields = ["isLimited", "isReloadable", "isPopular"];

    console.log('FETCHED! @@')
    return normalizeBooleanFields(normalized, booleanFields);

}