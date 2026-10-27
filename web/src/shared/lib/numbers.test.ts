import { describe, expect, it } from 'vitest'

import { formatCompact, niceCeiling, percentChange } from './numbers'

describe('percentChange', () => {
  it('rounds to whole percents unless asked for decimals', () => {
    expect(percentChange(7500, 4500)).toBe(67)
    expect(percentChange(3000, 4000)).toBe(-25)
    expect(percentChange(119, 110, 1)).toBe(8.2)
  })

  it('has nothing to say without a previous figure', () => {
    expect(percentChange(5000, 0)).toBeNull()
  })
})

describe('niceCeiling', () => {
  it('rounds up to a readable axis top', () => {
    expect(niceCeiling(8200)).toBe(10_000)
    expect(niceCeiling(21_000)).toBe(25_000)
    expect(niceCeiling(4500)).toBe(5000)
    expect(niceCeiling(1000)).toBe(1000)
    expect(niceCeiling(0)).toBe(0)
  })
})

describe('formatCompact', () => {
  it('shortens thousands and millions', () => {
    expect(formatCompact(0)).toBe('0')
    expect(formatCompact(950)).toBe('950')
    expect(formatCompact(5000)).toBe('5K')
    expect(formatCompact(12_500)).toBe('12.5K')
    expect(formatCompact(1_250_000)).toBe('1.3M')
  })
})
