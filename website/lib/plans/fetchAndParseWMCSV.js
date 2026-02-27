import { fetchAndParseSheetTab } from "./fetchAndParseSheetTab.js";
import { planValues } from "../../utils/planHeaders.js";
import dotenv from "dotenv";
dotenv.config();

export function fetchAndParseWMCSV() {
  return fetchAndParseSheetTab({
    sheetTab: process.env.DB_SHEET_WM_TAB,
    headerMap: planValues,
    booleanFields: ["isLimited", "isReloadable", "isPopular"],
    label: "WM",
  });
}
