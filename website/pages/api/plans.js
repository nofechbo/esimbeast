import { fetchAndParseCSV } from "@/lib/plans/fetchAndParseCSV";

export default async function handler(req, res) {
  try {
    const plans = await fetchAndParseCSV();
    res.status(200).json(plans);
  } catch (error) {
    console.error("API handler error:", error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }

}