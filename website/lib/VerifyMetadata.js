export const RequiredOrderMetadata = [
  'productId',
  'planName',
  'countryCodes',
  'data',
  'duration',
  'price',
]

export function isValidMetadata(metadata) {
  return RequiredOrderMetadata.every((key) => metadata[key] !== undefined)
}
