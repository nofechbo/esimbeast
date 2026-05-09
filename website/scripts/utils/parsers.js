import { Decimal } from "decimal.js";
import lookup from "country-code-lookup";

/***** HELPERS *****/
function extractNumberAndUnit(fieldName, normalizedStr) {
  const match = normalizedStr.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/i);
  if (!match) {
    throw new Error(
      `${fieldName} is not a valid number/unit string: "${normalizedStr}"`,
    );
  }

  return {
    value: parseFloat(match[1]),
    unit: match[2]?.toLowerCase() || null,
  };
}

function createSlug(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/***** SHARED PARSERS ****/
export function requireString(value, fieldName) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`missing required string field: ${fieldName}`);
  }
  return value.trim();
}

export function parseRequiredInt(value, fieldName) {
  if (typeof value === "number" && Number.isInteger(value)) return value;

  const s = requireString(value, fieldName);
  const n = Number(s);
  if (!Number.isInteger(n)) {
    throw new Error(
      `the value in field ${fieldName} must be an integer: "${value}"`,
    );
  }
  return n;
}

export function parseDataValue(fieldName, dataString) {
  if (!dataString || typeof dataString !== "string") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  const normalized = dataString.toLowerCase().trim();
  if (normalized === "unlimited") {
    return Decimal(0);
  }

  const parsed = extractNumberAndUnit(fieldName, normalized);

  if (!parsed.unit) {
    // no unit, assuming GB
    return new Decimal(parsed.value);
  }
  if (parsed.unit !== "gb" && parsed.unit !== "mb") {
    throw new Error(`Unknown data unit in ${fieldName}: ${parsed.unit}`);
  }

  // Convert to GB
  if (parsed.unit === "mb") {
    return new Decimal(parsed.value / 1000);
  }

  return new Decimal(parsed.value);
}

export function parseCountryCodes(countryCodesString, supplierName, productId) {
  if (!countryCodesString || typeof countryCodesString !== "string") {
    throw new Error("countryCodes must be a non-empty string");
  }

  const codes = countryCodesString
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code.length > 0);

  // Validate and filter out invalid country codes
  const validCodes = [];
  for (const code of codes) {
    try {
      lookup.byIso(code);
      validCodes.push(code);
    } catch (error) {
      console.warn(
        `[${supplierName}] Removing invalid country code "${code}" from row (productId: ${productId ?? ""}). String: ${countryCodesString}`,
      );
    }
  }

  if (validCodes.length === 0) {
    throw new Error(`No valid country codes in: "${countryCodesString}"`);
  }

  return validCodes;
}

export function cleanPlanName(planName, fieldName) {
  const name = requireString(planName, fieldName);

  return name
    .replace(/【[^】]*】/g, "") // Remove fullwidth corner brackets
    .replace(/\[[^\]]*\]/g, "") // Remove square brackets
    .replace(/\([^)]*\)/g, "") // Remove parentheses
    .replace(/\{[^}]*\}/g, "") // Remove curly braces
    .replace(/「[^」]*」/g, "") // Remove Japanese quotes
    .trim();
}

export function parseStringList(string) {
  if (!string || typeof string !== "string") {
    return [];
  }

  return string
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
}

export function parseReducedSpeed(speedString, fieldName) {
  if (
    speedString === null ||
    speedString === undefined ||
    typeof speedString !== "string"
  )
    throw new Error(`${fieldName} must be a non-empty string`);

  const normalized = speedString.toLowerCase().trim();
  if (normalized === "" || normalized === "unlimited") return null;

  const parsed = extractNumberAndUnit(fieldName, normalized);
  if (!parsed.unit) {
    throw new Error(
      `Speed unit missing in ${fieldName} string: ${speedString}`,
    );
  }
  if (parsed.unit !== "mbps" && parsed.unit !== "kbps") {
    throw new Error(`Unknown data unit in ${fieldName}: ${parsed.unit}`);
  }

  // Convert to kbps
  if (parsed.unit === "mbps") {
    return Math.round(parsed.value * 1000);
  }

  return Math.round(parsed.value);
}

/***** WM ONLY PARSERS ****/
export function parseBoolean(fieldValue) {
  if (typeof fieldValue !== "string" || fieldValue.trim() === "") return null;
  const val = fieldValue.toLowerCase().trim();
  if (val === "yes" || val === "true") return true;
  if (val === "no" || val === "false") return false;
  throw new Error(`Unknown boolean value: ${fieldValue}`);
}

export function WMIsPopular(row) {
  const targetLocations = new Set([
    "Taiwan",
    "Australia",
    "UAE - United Arab Emirates",
    "South Korea",
  ]);
  const targetDataGb = new Decimal(10);
  const targetDays = 7;

  try {
    const name = cleanPlanName(row["plan name"], "plan name");
    const days = parseInt(row["Days"], 10);
    const dataVal = parseDataValue("GB", row["GB"]);
    if (
      targetLocations.has(name) &&
      (days === targetDays || days === 30) &&
      dataVal.equals(targetDataGb)
    ) {
      return true;
    }
    return false;
  } catch (e) {
    console.warn(`Error evaluating popularity for row: ${e.message}`);
    return false;
  }
}

export function generateWMUniqueName(row) {
  const productId = requireString(row["wmproductId"], "wmproductId");
  const name = cleanPlanName(row["plan name"], "plan name");
  const days = requireString(row["Days"], "Days");
  const fup = requireString(row["GB"], "GB");

  const combined = `WM-${productId}-${name}-${days}-${fup}`;
  return createSlug(combined);
}

/***** EA ONLY PARSERS ****/
export function bytesToDataString(bytesString) {
  if (!bytesString) return "";

  const bytes = parseInt(bytesString, 10);
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

export function isEAPlanReloadable(supportTopUpType) {
  return parseInt(supportTopUpType, 10) === 2;
}

export function EAIspopular() {
  return Math.random() < 0.01;
}

// check and maybe update the string that returns
export function parseActivationType(type) {
  if (!type || typeof type !== "string") return null;

  type = parseInt(type, 10);
  if (type === 1) return "First installation";
  if (type === 2) return "First network connection";
  return null;
}

// strings copied from api. do we want to change to clarify?
export function parseEAPlanType(dataType, smsStatus) {
  if (
    !dataType ||
    typeof dataType !== "string" ||
    !smsStatus ||
    typeof smsStatus !== "string"
  )
    return null;

  dataType = parseInt(dataType, 10);
  smsStatus = parseInt(smsStatus, 10);

  let dataPart;
  if (dataType === 1) dataPart = "Data in Total";
  else if (dataType === 2) dataPart = "Daily Limit (Speed Reduced)";
  else if (dataType === 3) dataPart = "Daily Limit (Service Cut-off)";
  else if (dataType === 4) dataPart = "Daily Unlimited";
  else return null;

  let smsPart;
  if (smsStatus === 0) smsPart = "SMS not supported";
  else if (smsStatus === 1) smsPart = "API AND mobile phones SMS delivery";
  else if (smsStatus === 2) smsPart = "API SMS delivery only";
  else return null;

  return `${dataPart}, ${smsPart}`;
}

export function generateEAUniqueName(row) {
  const productId = requireString(row.packageCode, "packageCode");
  const name = cleanPlanName(row.name, "name");
  const days = requireString(row.duration, "duration");
  const fup = bytesToDataString(row.volume);

  const combined = `EA-${productId}-${name}-${days}-${fup}`;
  return createSlug(combined);
}
