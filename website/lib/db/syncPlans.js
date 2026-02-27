import { fetchAndParseWMCSV } from "../plans/fetchAndParseWMCSV.js";
import { fetchAndParseEsimAccessCSV } from "../plans/fetchAndParseEsimAccessCSV.js";
import { prisma } from "./prisma.js";
import { Decimal } from "decimal.js";
import lookup from "country-code-lookup";

const MIN_PLANS_THRESHOLD = 20;

function extractNumberAndUnit(fieldName, str) {
  if (!str || typeof str !== "string") {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  const normalized = str.toLowerCase().trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/i);

  if (!match) {
    return null;
  }

  return {
    value: parseFloat(match[1]),
    unit: match[2]?.toLowerCase() || null,
  };
}

function parseDataValue(dataString) {
  const parsed = extractNumberAndUnit("GB", dataString);

  if (!parsed) {
    return new Decimal(0); // for "unlimited" etc
  }

  if (!parsed.unit) {
    // no unit, assuming GB
    return new Decimal(parsed.value);
  }
  if (parsed.unit !== "gb" && parsed.unit !== "mb") {
    throw new Error(`Unknown data unit: ${parsed.unit}`);
  }

  // Convert to GB
  if (parsed.unit === "mb") {
    return new Decimal(parsed.value / 1000);
  }

  return new Decimal(parsed.value);
}

function parseCountryCodes(countryCodesString) {
  console.log("countryCodesString:", countryCodesString);
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
        `Skipping invalid country code "${code}". String: ${countryCodesString}`
      );
    }
  }

  return validCodes;
}

function parseStringList(s) {
  if (!s || typeof s !== "string") {
    return [];
  }

  return s
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
}

function parseReducedSpeed(speedString) {
  if (!speedString) return 0;
  const parsed = extractNumberAndUnit("Reduced speed", speedString);

  if (!parsed) {
    return 0;
  }

  if (!parsed.unit) {
    throw new Error(
      `Speed unit missing in reduced speed string: ${speedString}`
    );
  }
  if (parsed.unit !== "mbps" && parsed.unit !== "kbps") {
    throw new Error(`Unknown data unit: ${parsed.unit}`);
  }

  // Convert to kbps
  if (parsed.unit === "mbps") {
    return Math.round(parsed.value * 1000);
  }

  return Math.round(parsed.value);
}

function cleanPlanName(name) {
  if (!name || typeof name !== "string") {
    return name;
  }

  return name
    .replace(/【[^】]*】/g, "") // Remove fullwidth corner brackets
    .replace(/\[[^\]]*\]/g, "") // Remove square brackets
    .replace(/\([^)]*\)/g, "") // Remove parentheses
    .replace(/\{[^}]*\}/g, "") // Remove curly braces
    .replace(/「[^」]*」/g, "") // Remove Japanese quotes
    .trim();
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

function generateUniqueName(planData) {
  const combined = `${planData.productId}-${planData.name}-${planData.days}-${planData.fup}`;
  return createSlug(combined);
}

function transformCsvDataToPlan(planCsvData, supplier) {
  try {
    const dataValue = parseDataValue(planCsvData.dataCap);

    const planData = {
      productId: planCsvData.productId,
      code: planCsvData.code,
      name: cleanPlanName(planCsvData.name),
      days: parseInt(planCsvData.validity),
      limited: dataValue.greaterThan(0),
      fup: planCsvData.dataCap,
      data: dataValue,
      dailyDataCap: planCsvData.dailyDataCap || null,
      reducedSpeed: parseReducedSpeed(planCsvData.reducedSpeed),
      price: parseInt(planCsvData.price), // stored in cents
      reloadable: Boolean(planCsvData.isReloadable),
      countryCodes: parseCountryCodes(planCsvData.countryCodes),
      networks: parseStringList(planCsvData.networks),
      networkSpeed: planCsvData.networkSpeed || null,
      apn: planCsvData.apn || null,
      hotspot: Boolean(planCsvData.hotspot) || null,
      activation: planCsvData.activation || null,
      delivery: planCsvData.delivery || null,
      seoText: planCsvData.seoText || null,
      planType: planCsvData.planType || null,
      localNumber: planCsvData.localNumber || null,
      isPopular: Boolean(planCsvData.isPopular),
      supplier,
    };

    planData.uniqueName = generateUniqueName(planData);

    return planData;
  } catch (error) {
    throw new Error(
      `Error parsing plan ${JSON.stringify(planCsvData, null, 2)}: ${
        error.message
      }`
    );
  }
}

async function upsertAndDelete(supplier, transformedPlans, totalFromCsv) {
  const csvUniqueNames = new Set(transformedPlans.map((p) => p.uniqueName));

  const existingPlans = await prisma.plan.findMany({ where: { supplier } });
  const existingUniqueNames = new Set(existingPlans.map((p) => p.uniqueName));

  console.log(`Upserting ${supplier} plans...`);
  let upserted = 0;

  for (const planData of transformedPlans) {
    try {
      await prisma.plan.upsert({
        where: { uniqueName: planData.uniqueName },
        update: planData,
        create: planData,
      });
      upserted++;
      if (upserted % 10 === 0) {
        console.log(`Upserted ${upserted}/${transformedPlans.length} plans`);
      }
    } catch (error) {
      console.error(
        `❌ Error upserting plan ${planData.uniqueName}:`,
        error.message
      );
    }
  }
  console.log(`Upserted ${upserted} ${supplier} plans total`);

  const plansToDelete = [...existingUniqueNames].filter(
    (name) => !csvUniqueNames.has(name)
  );
  let deleted = 0;

  if (plansToDelete.length > 0) {
    console.log(`Deleting ${plansToDelete.length} removed ${supplier} plans...`);
    try {
      const deleteResult = await prisma.plan.deleteMany({
        where: { supplier, uniqueName: { in: plansToDelete } },
      });
      deleted = deleteResult.count;
      console.log(`Deleted ${deleted} plans`);
    } catch (error) {
      console.error(`❌ Error deleting ${supplier} plans:`, error.message);
    }
  }

  console.log(`${supplier} sync completed! Upserted: ${upserted}, Deleted: ${deleted}`);
  return { success: true, totalFromCsv, upserted, deleted };
}

export async function syncWMPlans() {
  console.log("Fetching WM CSV data...");
  const allCsvData = await fetchAndParseWMCSV();
  console.log(`Found ${allCsvData.length} plans in CSV`);

  const validCsvData = allCsvData.filter(
    (row) => row.productId?.trim() && row.dataCap?.trim()
  );

  if (validCsvData.length < allCsvData.length) {
    console.log(
      `Filtered out ${allCsvData.length - validCsvData.length} empty/invalid rows`
    );
  }
  if (validCsvData.length < MIN_PLANS_THRESHOLD) {
    throw new Error(
      `Aborting sync: CSV contains only ${validCsvData.length} valid plans, minimum threshold is ${MIN_PLANS_THRESHOLD}`
    );
  }

  const targetLocations = new Set([
    "Taiwan",
    "Australia",
    "UAE - United Arab Emirates",
    "South Korea",
  ]);
  const targetDataGb = new Decimal(10);
  const targetDays = 7;

  validCsvData.forEach((row) => { row.isPopular = false; });
  validCsvData.forEach((row) => {
    try {
      const name = cleanPlanName(row.name);
      const days = parseInt(row.validity, 10);
      const dataVal = parseDataValue(row.dataCap);
      if (
        targetLocations.has(name) &&
        (days === targetDays || days === 30) &&
        dataVal.equals(targetDataGb)
      ) {
        row.isPopular = true;
      }
    } catch (e) {
      console.warn(`Error evaluating popularity for row: ${e.message}`);
    }
  });

  const transformedPlans = validCsvData.map((row) =>
    transformCsvDataToPlan(row, "WM")
  );
  return upsertAndDelete("WM", transformedPlans, allCsvData.length);
}

export async function syncEsimAccessPlans() {
  console.log("Fetching EA CSV data...");
  const allCsvData = await fetchAndParseEsimAccessCSV();
  console.log(`Found ${allCsvData.length} EA plans with Price set in sheet`);

  if (allCsvData.length === 0) {
    console.log("No EA plans ready for sync (Price column empty). Skipping.");
    return { success: true, totalFromCsv: 0, upserted: 0, deleted: 0 };
  }

  const transformedPlans = allCsvData.map((row) =>
    transformCsvDataToPlan(row, "EA")
  );
  return upsertAndDelete("EA", transformedPlans, allCsvData.length);
}

export async function getPlanStats() {
  const total = await prisma.plan.count();
  const countries = await prisma.plan.findMany({
    select: { countryCodes: true },
    distinct: ["countryCodes"],
  });

  const uniqueCountries = new Set();
  countries.forEach((plan) => {
    plan.countryCodes.forEach((code) => uniqueCountries.add(code));
  });

  return {
    totalPlans: total,
    uniqueCountries: uniqueCountries.size,
  };
}
