import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.ESIMACCESS_BASE_URL;

async function postApi(path, body = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "RT-AccessCode": process.env.ESIMACCESS_ACCESS_CODE,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `eSIM Access API error ${response.status}: ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(
      `eSIM Access API failed: ${data.errorCode} - ${data.errorMessage}`,
    );
  }

  return data.obj;
}

// Builds a map from locationCode -> [Alpha-2 country codes]
async function buildLocationMap() {
  const obj = await postApi("/location/list", {});
  const locations = Array.isArray(obj)
    ? obj
    : (obj?.locationList ?? obj?.list ?? Object.values(obj ?? {})[0] ?? []);
  if (!Array.isArray(locations)) {
    console.error(
      "Unexpected /location/list response shape:",
      JSON.stringify(obj),
    );
    return new Map();
  }
  const locationsMap = new Map();

  function collectCodes(location) {
    if (location.type === 1) {
      // Single country - code is already Alpha-2
      locationsMap.set(location.code, [location.code]);
    } else if (location.type === 2) {
      // Multi-country region - collect from subLocations
      const codes = [];
      for (const sub of location.subLocation || []) {
        collectCodes(sub);
        const subCodes = locationsMap.get(sub.code) || [];
        codes.push(...subCodes);
      }
      locationsMap.set(location.code, [...new Set(codes)]);
    }
  }

  for (const loc of locations) {
    collectCodes(loc);
  }

  return locationsMap;
}

export async function fetchEsimAccessPackages() {
  const [locationMap, apiResponse] = await Promise.all([
    buildLocationMap(),
    postApi("/package/list", {}),
  ]);

  const packages = apiResponse?.packageList || [];

  return packages.map((pkg) => {
    const locationCode = pkg.location || "";
    let resolvedCountryCodes = locationMap.get(locationCode);

    if (!resolvedCountryCodes) {
      // Fallback: location may be a comma-separated list of Alpha-2 codes
      if (locationCode.includes(",")) {
        resolvedCountryCodes = locationCode
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter((c) => c.length === 2);
      } else {
        resolvedCountryCodes =
          locationCode.length === 2 ? [locationCode.toUpperCase()] : [];
      }
    }

    const missing = [];
    if (!pkg.packageCode) missing.push("packageCode");
    if (!pkg.name) missing.push("name");
    if (!pkg.duration) missing.push("duration");
    if (!pkg.volume) missing.push("volume");
    if (!pkg.price) missing.push("price");
    if (resolvedCountryCodes.length === 0) missing.push("countryCodes");
    if (missing.length > 0) {
      console.warn(
        `Package ${pkg.packageCode || pkg.slug || "unknown"} (location: ${locationCode}) missing: ${missing.join(", ")}`,
      );
    }

    return { ...pkg, resolvedCountryCodes };
  });
}
