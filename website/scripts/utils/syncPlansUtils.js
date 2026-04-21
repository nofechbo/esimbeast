import { prisma } from "../../lib/db/prisma.js";
import { supplierToDBFuncMap } from "./mapping.js";
import dotenv from "dotenv";
dotenv.config();

export const MIN_PLANS_THRESHOLD = 20;

export const suppliers = {
  wm: {
    name: "WM",
    sheetId: process.env.DB_SHEET_ID,
    sheetTabGid: process.env.DB_SHEET_WM_TAB_GID,
  },
  EA: {
    name: "EA",
    sheetId: process.env.DB_SHEET_ID,
    sheetTabGid: process.env.DB_SHEET_EA_TAB_GID,
  },
};

export function transformCsvDataToPlan(csvRow, supplierName) {
  const funcs = supplierToDBFuncMap[supplierName];
  if (!funcs) {
    throw new Error(`unknown supplier: ${supplierName}`);
  }

  try {
    return {
      productId: funcs.productId(csvRow),
      code: funcs.code(csvRow),
      name: funcs.name(csvRow),
      days: funcs.days(csvRow),
      limited: funcs.limited(csvRow),
      fup: funcs.fup(csvRow),
      data: funcs.data(csvRow),
      dailyDataCap: funcs.dailyDataCap(csvRow),
      reducedSpeed: funcs.reducedSpeed(csvRow),
      price: funcs.price(csvRow),
      supplierPrice: funcs.supplierPrice(csvRow),
      reloadable: funcs.reloadable(csvRow),
      countryCodes: funcs.countryCodes(csvRow),
      networks: funcs.networks(csvRow),
      networkSpeed: funcs.networkSpeed(csvRow),
      apn: funcs.apn(csvRow),
      hotspot: funcs.hotspot(csvRow),
      activation: funcs.activation(csvRow),
      delivery: funcs.delivery(csvRow),
      seoText: funcs.seoText(csvRow),
      planType: funcs.planType(csvRow),
      localNumber: funcs.localNumber(csvRow),
      eKYC: funcs.eKYC(csvRow),
      uniqueName: funcs.uniqueName(csvRow),
      isPopular: funcs.isPopular(csvRow),
      supplier: funcs.supplier(csvRow),
    };
  } catch (error) {
    console.warn(
      `[${supplierName}] Skipping row (productId: ${csvRow["wmproductId"] ?? csvRow.packageCode ?? "unknown"}): ${error.message}`,
    );
    return;
  }
}

export async function upsertAndDelete(
  supplier,
  transformedPlans,
  totalFromCsv,
) {
  if (transformedPlans.length === 0) {
    console.warn(`[${supplier}] No valid plans to sync — aborting to avoid deleting existing plans.`);
    return { success: false, totalFromCsv, upserted: 0, deleted: 0 };
  }

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
        error.message,
      );
    }
  }
  console.log(`Upserted ${upserted} ${supplier} plans total`);

  const plansToDelete = [...existingUniqueNames].filter(
    (name) => !csvUniqueNames.has(name),
  );
  let deleted = 0;

  if (plansToDelete.length > 0) {
    console.log(
      `Deleting ${plansToDelete.length} removed ${supplier} plans...`,
    );
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

  console.log(
    `${supplier} sync completed! Upserted: ${upserted}, Deleted: ${deleted}`,
  );
  return { success: true, totalFromCsv, upserted, deleted };
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
