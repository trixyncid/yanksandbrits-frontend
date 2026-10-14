export type PillTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral'

/** Maps the table badge tones used by payment-display to pill tones. */
export function pillToneFor(
  tone: 'info' | 'success' | 'danger' | 'neutral' | 'primary' | 'warning',
): PillTone {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'danger') return 'danger'
  if (tone === 'neutral') return 'neutral'
  return 'brand'
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Plain-language plan status used on the redesigned money pages. */
export function planStatusCopy(status: 'incomplete' | 'complete') {
  return status === 'complete' ? 'Fully paid' : 'Still collecting'
}
