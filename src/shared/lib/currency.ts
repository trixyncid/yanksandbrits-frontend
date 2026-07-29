/** Strip non-digits from a currency input string. */
export function parseCurrencyDigits(value: string) {
  return value.replace(/[^\d]/g, '')
}

/** Parse currency input into a number (0 when empty). */
export function parseCurrencyValue(value: string) {
  const digits = parseCurrencyDigits(value)
  return digits ? Number(digits) : 0
}

/** Format digit string with Indonesian thousand separators (e.g. 3500000 → 3.500.000). */
export function formatCurrencyDigits(value: string) {
  const digits = parseCurrencyDigits(value)
  if (!digits) {
    return ''
  }

  return new Intl.NumberFormat('id-ID').format(Number(digits))
}
