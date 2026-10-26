// Western digits in both languages, as in the mobile app and on Iraqi price tags.
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** 4212000 -> "4,212,000" */
export function formatInteger(value: number): string {
  return integer.format(value)
}

/** 4.25 -> "4.3" */
export function formatOneDecimal(value: number): string {
  return oneDecimal.format(value)
}
