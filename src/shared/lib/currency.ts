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

/** Format numeric amount as IDR without decimals. */
export function formatCurrencyAmount(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Compact IDR for charts and dense KPI rows. */
export function formatCurrencyCompact(amount: number) {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (abs >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `Rp ${Math.round(amount / 1_000)}K`
  }
  return formatCurrencyAmount(amount)
}
