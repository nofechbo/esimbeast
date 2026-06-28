import {
  bytesToDataString,
  cleanPlanName,
  EAIspopular,
  isEAPlanReloadable,
  parseActivationType,
  parseBoolean,
  parseCountryCodes,
  parseEAPlanType,
  parseDataValue,
  parseReducedSpeed,
  parseRequiredInt,
  parseStringList,
  requireString,
  WMIsPopular,
  generateWMUniqueName,
  generateEAUniqueName,
  eaResalePriceCents,
  eaUnitsToCents,
  eaNotification,
} from "./parsers.js";

export const supplierToDBFuncMap = {
  WM: {
    productId: (row) => requireString(row["wmproductId"], "wmproductId"),
    code: (row) => requireString(row["Code"], "Code"),
    name: (row) => cleanPlanName(row["plan name"], "plan name"),
    days: (row) => parseRequiredInt(row["Days"], "Days"),
    limited: (row) => parseDataValue("GB", row["GB"]).greaterThan(0),
    fup: (row) => requireString(row["GB"], "GB"),
    data: (row) => parseDataValue("GB", row["GB"]),
    dailyDataCap: (row) => row["GB per day"]?.trim() || null,
    reducedSpeed: (row) =>
      parseReducedSpeed(row["reduced speed"], "reduced speed"),
    price: (row) => parseRequiredInt(row["Sell Price"], "Sell Price"), // stored in cents
    supplierPrice: () => null,
    reloadable: (row) => parseBoolean(row["Reloadable"]) ?? false,
    countryCodes: (row) =>
      parseCountryCodes(row["Country code"], "WM", row["wmproductId"]),
    networks: (row) => parseStringList(row["Networks"]),
    networkSpeed: (row) => row["Network Speed"]?.trim() || null,
    apn: (row) => row["APN"]?.trim() || null,
    hotspot: (row) => parseBoolean(row["Hotspot"]) ?? null,
    activation: (row) => row["Activation"]?.trim() || null,
    delivery: (row) => row["Delivery"]?.trim() || null,
    seoText: (row) => row["Your Plan Summary"]?.trim() || null,
    planType: (row) => row["Plan Type"]?.trim() || null,
    localNumber: (row) => row["Local Number"]?.trim() || null,
    notification: (row) => row["notification"]?.trim() || null,
    eKYC: () => null,
    uniqueName: (row) => generateWMUniqueName(row),
    isPopular: (row) => WMIsPopular(row),
    supplier: () => "WM",
  },

  EA: {
    productId: (row) => requireString(row.packageCode, "packageCode"),
    code: (row) => requireString(row.slug, "slug"),
    name: (row) => cleanPlanName(row.name, "name"),
    days: (row) => parseRequiredInt(row.duration, "duration"),
    limited: (row) =>
      parseDataValue("volume", bytesToDataString(row.volume)).greaterThan(0),
    fup: (row) => bytesToDataString(row.volume),
    data: (row) => parseDataValue("volume", bytesToDataString(row.volume)),
    dailyDataCap: () => null,
    // FUP speed is a non-critical note; some EA fupPolicy values are malformed
    // (e.g. the "kpbs" typo). Tolerate it -> null rather than dropping the whole
    // sellable plan. (WM keeps the strict parse so sheet typos surface.)
    reducedSpeed: (row) => {
      try {
        return parseReducedSpeed(row.fupPolicy, "fupPolicy");
      } catch {
        return null;
      }
    },
    // Hand-set "Price in cents" wins; otherwise 2x cost (EA retailPrice). This is
    // what unlocks the full catalog — a blank price no longer drops the row.
    price: (row) => eaResalePriceCents(row), // stored in cents
    supplierPrice: (row) => eaUnitsToCents(row.price), // cost, normalized to cents
    reloadable: (row) => isEAPlanReloadable(row.supportTopUpType),
    countryCodes: (row) =>
      parseCountryCodes(row.resolvedCountryCodes, "EA", row.packageCode),
    networks: (row) => parseStringList(row.locationNetworkList),
    networkSpeed: (row) => row.speed ?? null,
    apn: () => null,
    hotspot: () => null, // EA exposes no per-package hotspot flag
    activation: (row) => parseActivationType(row.activeType) ?? null,
    delivery: () => null,
    seoText: (row) => row.description ?? null,
    planType: (row) => parseEAPlanType(row.dataType, row.smsStatus) ?? null,
    localNumber: () => null, // EA exposes no per-package local-number flag
    notification: (row) => eaNotification(row),
    eKYC: () => null,
    uniqueName: (row) => generateEAUniqueName(row),
    isPopular: () => EAIspopular(),
    supplier: () => "EA",
  },
};
