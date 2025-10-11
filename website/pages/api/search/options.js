import { getAllPlans } from "@/lib/db/plans";
import { getCountryName } from "@/utils/homepage/codeToCountry";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const countries = new Set();
  const dataSizes = new Set();
  const durations = new Set();

  try {
    const allPlans = await getAllPlans();

    allPlans.forEach((plan) => {
      dataSizes.add(plan.data);
      durations.add(plan.days);

      plan.countryCodes.forEach((code) => {
        if (typeof code === "string" && code.trim()) {
          const country = getCountryName(code.trim());
          if (country) countries.add(country);
        }
      });
    });

    res.status(200).json({
      countries: Array.from(countries).sort((a, b) => a.localeCompare(b)),
      dataSizes: Array.from(dataSizes).sort((a, b) => a - b),
      durations: Array.from(durations).sort((a, b) => a - b),
    });
    
  } catch (error) {
    console.error("Error fetching search options:", error);
    res.status(500).json({ error: "Failed to fetch search options" });
  }
}
