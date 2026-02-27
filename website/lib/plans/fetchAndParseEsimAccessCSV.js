import { fetchAndParseSheetTab } from "./fetchAndParseSheetTab.js";
import { esimAccessPlanValues } from "../../utils/esimAccessPlanHeaders.js";
import dotenv from "dotenv";
dotenv.config();

export function fetchAndParseEsimAccessCSV() {
  return fetchAndParseSheetTab({
    sheetTab: process.env.DB_SHEET_EA_TAB,
    headerMap: esimAccessPlanValues,
    booleanFields: ["isReloadable"],
    rowFilter: (row) => row["Price"] && row["Price"].trim() !== "",
    label: "EA",
  });
}
