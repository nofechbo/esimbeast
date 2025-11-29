import { getSearchOptionsData } from "@/lib/db/plans";
import { getCountryName } from "@/utils/homepage/codeToCountry";

const CACHE_TTL = 60 * 60 * 1000; // 60 minutes
let cachedOptions = null;
let cacheTimestamp = 0;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  let timingStart;

  try {
    // Check cache
    const now = Date.now();
    if (cachedOptions && now - cacheTimestamp < CACHE_TTL) {
      res.status(200).json(cachedOptions);
      return;
    }

    const countries = new Set();
    const dataSizes = new Set();
    const durations = new Set();

    const allPlans = await getSearchOptionsData();

    allPlans.forEach((plan) => {
      dataSizes.add(Number(plan.data));
      durations.add(plan.days);

      plan.countryCodes.forEach((code) => {
        if (typeof code === "string" && code.trim()) {
          const country = getCountryName(code.trim());
          if (country) countries.add(country);
        }
      });
    });

    const response = {
      countries: Array.from(countries).sort((a, b) => a.localeCompare(b)),
      dataSizes: Array.from(dataSizes).sort((a, b) => a - b),
      durations: Array.from(durations).sort((a, b) => a - b),
    };

    // Update cache
    cachedOptions = response;
    cacheTimestamp = now;

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching search options:", error);
    res.status(500).json({ error: "Failed to fetch search options" });
  }
}
