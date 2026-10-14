/** Brand chart scale (hex is allowed for chart series only). */
export const BRAND_CHART = {
  ink: '#141B3A',
  brand900: '#0F1840',
  brand800: '#15225A',
  brand700: '#1A2A71',
  brand600: '#1F3289',
  brand500: '#253CA1',
  brand400: '#5A6FC6',
  brand300: '#8C9DDD',
  brand200: '#B9C4EC',
  brand100: '#DCE2F6',
  brand50: '#EEF1FB',
  gray: '#929499',
  graySoft: '#E7E8EA',
  canvas: '#EEF0F6',
} as const

/**
 * Series colors for categorical breakdowns (e.g. lead sources). The brand is
 * one hue, so neighbours alternate dark / light / grey to stay apart (checked
 * with the dataviz palette validator: adjacent ΔE ≥ 25 incl. colour-blind
 * simulations). Charts using it always show labels + numbers beside the marks.
 */
export const BRAND_SERIES = [
  BRAND_CHART.brand700,
  BRAND_CHART.brand300,
  BRAND_CHART.brand500,
  BRAND_CHART.gray,
  BRAND_CHART.brand900,
  BRAND_CHART.brand200,
] as const
