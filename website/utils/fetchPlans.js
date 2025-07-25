import { readFile } from "fs/promises";

export async function fetchPlans() {
   
    try {
        const filePath = "data/plans.json"
        const content = await readFile(filePath, "utf-8");

        return JSON.parse(content);
    } catch(err) {
        console.warn("Failed to load cached plans: " + err.message);
        return [];
    } 
}