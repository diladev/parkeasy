/**
 * Percentage change from `previous` to `current`, e.g. 4,500 -> 7,500 is 67.
 * null when there is nothing to compare with (previous is 0).
 */
export function percentChange(current: number, previous: number, decimals = 0): number | null {
  if (previous <= 0) return null
  const factor = 10 ** decimals
  return Math.round(((current - previous) / previous) * 100 * factor) / factor
}

/**
 * A round top for a chart axis just above `max`: 1, 2, 2.5 or 5 times a power
 * of ten (8,200 -> 10,000; 21,000 -> 25,000). 0 stays 0.
 */
export function niceCeiling(max: number): number {
  if (max <= 0) return 0
  const power = 10 ** Math.floor(Math.log10(max))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= max) ?? 10
  return step * power
}

/** 0 / 950 / 5K / 12.5K / 1.2M, Western digits in both languages, for axis ticks. */
export function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const [divisor, suffix] = abs >= 1e6 ? [1e6, 'M'] : abs >= 1e3 ? [1e3, 'K'] : [1, '']
  const scaled = Math.round((value / divisor) * 10) / 10
  return `${scaled}${suffix}`
}
