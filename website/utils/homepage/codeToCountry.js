import lookup from "country-code-lookup";

export function getCountryCode(countryName) {
  if (!countryName) return null;
  const country = lookup.byCountry(countryName);
  return country?.iso2 || country?.iso3 || null;
}

export function getCountryName(countryCode) {
  if (!countryCode) return null;
  const country = lookup.byIso(countryCode); 
  return country?.country || null;
}

 

// lookup.byIso("CN").country; // → "China"
// lookup.byCountry("China").iso2; // → "CN"
// lookup.byCountry("China").iso3; // → "CHN"