import { describe, expect, it } from 'vitest'

import { occupancyColor, parseLevel, percent, revenueChange } from './garage-figures'

describe('garage figures', () => {
  it('rounds percentages and survives an empty garage', () => {
    expect(percent(5, 28)).toBe(18)
    expect(percent(0, 0)).toBe(0)
  })

  it.each([
    [0, 'success'],
    [59, 'success'],
    [60, 'warning'],
    [79, 'warning'],
    [80, 'error'],
    [100, 'error'],
  ] as const)('colours %i%% as %s', (value, color) => {
    expect(occupancyColor(value)).toBe(color)
  })

  it('compares revenue only when there is something to compare with', () => {
    expect(revenueChange(7500, 3000)).toBe(150)
    expect(revenueChange(1500, 3000)).toBe(-50)
    expect(revenueChange(1500, 0)).toBeNull()
  })

  it('reads level names', () => {
    expect(parseLevel('G')).toEqual({ kind: 'ground' })
    expect(parseLevel('B2')).toEqual({ kind: 'basement', number: 2 })
    expect(parseLevel('F1')).toEqual({ kind: 'floor', number: 1 })
    expect(parseLevel('Roof')).toEqual({ kind: 'other', name: 'Roof' })
  })
})
