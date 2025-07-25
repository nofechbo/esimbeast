import { fetchFromAPI } from "./fetchFromAPI.mjs";
import { existsSync } from 'fs'
import { writeFile, rename, readFile } from "fs/promises";
import { config } from 'dotenv';
import path from 'path';

config({ path: ".env" });
const REVALIDATION_HOURS = 6;

async function updatePlans() {
    const targetPath = path.resolve("../website/data/plans.json");
    const tmpPath = path.resolve("../website/data/plans.tmp.json");
    
    try {
        const result = await fetchFromAPI();
        const plans = result?.prodList;

        if (!plans) return;

        const newData = JSON.stringify(plans, null, 2);

        //only update if any data changed
        if (existsSync(targetPath)) {
            const existingData = await readFile(targetPath, 'utf-8');
            if (existingData === newData) {
                console.log("No changes detected, skipping update");
                return;
            }
        }
        //write to a tmp file first to avoid mid-write crashes
        await writeFile(tmpPath, newData);
        await rename(tmpPath, targetPath);

        console.log("Plans updated at", new Date().toISOString());

    } catch (err) {
        console.error("Error updating plans:", err);
    } 
}

updatePlans(); // run immediately on start
setInterval(updatePlans,  24 * 60 * 60 * 1000); // once a day
//setInterval(updatePlans, 60 * 1000); //1 minute, for testing