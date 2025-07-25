import { fetchAndParseCSV } from "@/lib/plans/fetchAndParseCSV";

// const sheetId = "19FMgoB6l9znMsI4F5fzW7zR8vxfej_5YLM7YTx1r3nw";
const sheetId = "1gYn3DuZLtY22EK2RN-iHaFOnxBU4lTQVh6Oe26O6jJg"; //test sheet
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;


export default async function handler(req, res) {
  try {
    const plans = await fetchAndParseCSV(SHEET_URL);
    res.status(200).json(plans);
  } catch (error) {
    console.error("API handler error:", error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }

}