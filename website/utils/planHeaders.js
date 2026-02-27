export const planValues = {
  productId: "wmproductId",
  code: "Code",
  name: "plan name",
  validity: "Days",
  dataCap: "GB",
  dailyDataCap: "GB per day",
  countryCodes: "Country code",
  networks: "Networks",
  networkSpeed: "Network Speed",
  apn: "APN",
  price: "Sell Price",
  isReloadable: "Reloadable",
  reducedSpeed: "reduced speed",
  hotspot: "Hotspot",
  activation: "Activation",
  delivery: "Delivery",
  seoText: "Your Plan Summary",
  planType: "Plan Type",
  localNumber: "Local Number",
};

// We want to do this instead of the current code:
// ===
// const fields = {
//   "code": {
//     "parser": parseCode,
//     "dbField": "code",
//   },
//     "data": {
//     "parser": parseData,
//     "dbField": "data",
//   },   "isReloadable": {
//     "parser": parseBoolean,
//     "dbField": "isReloadable",
//   }
// }

// for { row in csv } {
//   for(head in headers) {
//     x = fields[head]
//     plan[x.dbField] = x.parser(row[head])
//   }
// }