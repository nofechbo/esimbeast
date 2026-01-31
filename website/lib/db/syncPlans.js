import { fetchAndParseCSV } from "../plans/fetchAndParseCSV.js";
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

function transformCsvDataToPlan(planCsvData) {
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

export async function syncPlansFromCSV() {
  // Fetch CSV data
  console.log("Fetching CSV data...");
  const allCsvData = await fetchAndParseCSV();
  console.log(`Found ${allCsvData.length} plans in CSV`);

  // Filter out empty rows (rows where essential fields are empty)
  const validCsvData = allCsvData.filter((row) => {
    return (
      row.productId &&
      row.productId.trim() !== "" &&
      row.dataCap &&
      row.dataCap.trim() !== ""
    );
  });

  if (validCsvData.length < allCsvData.length) {
    console.log(
      `Filtered out ${
        allCsvData.length - validCsvData.length
      } empty/invalid rows`
    );
  }

  if (validCsvData.length < MIN_PLANS_THRESHOLD) {
    throw new Error(
      `Aborting sync: CSV contains only ${validCsvData.length} valid plans, minimum threshold is ${MIN_PLANS_THRESHOLD}`
    );
  }

  // Mark as popular any plan that matches one of the target
  // locations and has the specified data size and days.
  // Targets: name in [Taiwan, Australia, USA], data = 10 (GB), days = 7
  const targetLocations = new Set([
    "Taiwan",
    "Australia",
    "UAE - United Arab Emirates",
    "South Korea",
  ]);
  const targetDataGb = new Decimal(10);
  const targetDays = 7;

  // Reset all to not popular first
  validCsvData.forEach((row) => {
    row.isPopular = false;
  });

  // Mark matching rows as popular
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
      // If parsing fails, leave as not popular and continue
      console.warn(`Error evaluating popularity for row: ${e.message}`);
    }
  });

  // Transform data
  const transformedPlans = validCsvData.map(transformCsvDataToPlan);
  const csvUniqueNames = new Set(transformedPlans.map((p) => p.uniqueName));

  // Get existing uniqueNames from database
  const existingPlans = await prisma.plan.findMany({});
  const existingUniqueNames = new Set(existingPlans.map((p) => p.uniqueName));

  // Upsert plans (create + update)
  console.log("Upserting plans...");
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
      // Continue with next plan
    }
  }
  console.log(`Upserted ${upserted} plans total`);

  // Delete plans not in CSV anymore
  const plansToDelete = [...existingUniqueNames].filter(
    (name) => !csvUniqueNames.has(name)
  );
  let deleted = 0;

  if (plansToDelete.length > 0) {
    console.log(`Deleting ${plansToDelete.length} removed plans...`);
    try {
      const deleteResult = await prisma.plan.deleteMany({
        where: {
          uniqueName: { in: plansToDelete },
        },
      });
      deleted = deleteResult.count;
      console.log(`Deleted ${deleted} plans`);
    } catch (error) {
      console.error(`❌ Error deleting plans:`, error.message);
    }
  }

  console.log(
    `Plan sync completed! Upserted: ${upserted}, Deleted: ${deleted}`
  );

  // Return summary
  return {
    success: true,
    totalFromCsv: allCsvData.length,
    upserted,
    deleted,
  };
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
