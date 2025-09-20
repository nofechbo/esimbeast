export const RequiredOrderMetadata = [
  'uniqueName',
  'qty',
]

export function isValidMetadata(metadata) {
  return RequiredOrderMetadata.every((key) => metadata[key] !== undefined)
}
