// import { readFile } from "fs/promises";

export async function fetchPlans() {
    try {
          const response = await fetch('http://localhost:3000/api/plans');
          const plans = await response.json();
            if (!response.ok) {
                throw new Error(plans?.msg || plans?.error || `error ${response.status}`);
            }
            return plans;

    } catch (err) {
        console.error("error in fetch plans", err)
        return []
    }
    


    // try {
    //     const filePath = "data/plans.json"
    //     const content = await readFile(filePath, "utf-8");

    //     return JSON.parse(content);
    // } catch(err) {
    //     console.warn("Failed to load cached plans: " + err.message);
    //     return [];
    // } 
} 