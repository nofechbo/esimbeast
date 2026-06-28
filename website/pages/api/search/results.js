import { findPlansByFilters } from "@/lib/db/plans";
import slugify from "@/utils/formaters";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { countryCode, dataSize, duration } = req.body;

  if (!countryCode || !dataSize || !duration) {
    return res
      .status(400)
      .json({ error: "Missing required search parameters" });
  }

  try {
    const filteredPlans = await findPlansByFilters({
      countryCode,
      dataSize: Number(dataSize),
      duration: Number(duration),
    });

    if (filteredPlans.length === 0) {
      return res
        .status(404)
        .json({ msg: "No plans found matching the criteria" });
    }

    if (filteredPlans.length > 1) {
      // capped (total-data) plans win over daily-limit ones; then cheapest.
      filteredPlans.sort(
        (a, b) => Number(b.isCapped) - Number(a.isCapped) || a.price - b.price,
      );
    }

    const slug = slugify(filteredPlans[0].uniqueName);
    const planUrl = `plans/${slug}`;

    return res.status(200).json({ planUrl });
  } catch (error) {
    console.error("Error searching plans:", error);
    return res.status(500).json({ error: "Failed to search plans" });
  }
}
