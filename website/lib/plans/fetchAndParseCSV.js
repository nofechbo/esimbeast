import { parse } from "csv-parse/sync";
import { planValues } from "@/utils/planHeaders";

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
            const value = row[key]?.toLowerCase().trim();
            if (value === "yes") normalized[key] = true;
            else if (value === "no") normalized[key] = false;
        }
        return normalized;
    });
}

export async function fetchAndParseCSV(sheetUrl) {
    let records;
    let response;
    
    try {
        response = await fetch(sheetUrl);
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

    const booleanFields = [
        planValues.isLimited,
        planValues.isReloadable,
        planValues.isPopular,
    ];
    return normalizeBooleanFields(records, booleanFields);;
}