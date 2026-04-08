import { prisma } from "../lib/db/prisma.js";
import { fetchGoogleSheet, parseCsv } from "./utils/sheets.js";
import {
  getPlanStats,
  MIN_PLANS_THRESHOLD,
  suppliers,
  transformCsvDataToPlan,
  upsertAndDelete,
} from "./utils/syncPlansUtils.js";

async function main() {
  console.log("Starting plan synchronization...\n");
  try {
    // Show current stats
    console.log("Current database stats:");
    const beforeStats = await getPlanStats();
    console.log(`   Plans: ${beforeStats.totalPlans}`);
    console.log(`   Countries: ${beforeStats.uniqueCountries}\n`);

    // sync plans by supplier
    for (const supplier of Object.values(suppliers)) {
      try {
        // 1. fetch data from google sheet
        console.log(`Syncing plans for supplier: ${supplier.name}`);
        const csvData = await fetchGoogleSheet(
          supplier.sheetId,
          supplier.sheetTab,
        );

        // 2. parse CSV data
        const parsedData = parseCsv(csvData);
        console.log(
          `Found ${parsedData.length} rows for supplier ${supplier.name}`,
        );

        if (parsedData.length < MIN_PLANS_THRESHOLD) {
          console.warn(
            `Aborting sync: CSV contains only ${parsedData.length} valid plans, minimum threshold is ${MIN_PLANS_THRESHOLD}`,
          );
          continue;
        }

        console.log(
          `Transforming CSV data to plan format for supplier ${supplier.name}...`,
        );
        const transformedPlans = parsedData
          .map((row) => transformCsvDataToPlan(row, supplier.name))
          .filter(Boolean);

        console.log(
          `Transformed ${transformedPlans.length} plans for supplier ${supplier.name}`,
        );

        if (transformedPlans.length < MIN_PLANS_THRESHOLD) {
          console.warn(
            `Aborting sync for ${supplier.name}: only ${transformedPlans.length} plans transformed successfully, minimum threshold is ${MIN_PLANS_THRESHOLD}`,
          );
          continue;
        }

        console.log(
          "Upserting and deleting plans in database for supplier:",
          supplier.name,
        );

        // 3. update DB
        await upsertAndDelete(
          supplier.name,
          transformedPlans,
          parsedData.length,
        );
      } catch (error) {
        console.error(
          `Error syncing plans for supplier ${supplier.name}:`,
          error.message,
        );
      }
    }

    // Show updated stats
    console.log("\nUpdated database stats:");
    const afterStats = await getPlanStats();
    console.log(`   Plans: ${afterStats.totalPlans}`);
    console.log(`   Countries: ${afterStats.uniqueCountries}`);

    console.log("\nSync completed successfully!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
