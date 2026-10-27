import { describe, expect, it } from 'vitest'

import { compare, splitMinutes } from './dashboard-figures'

describe('compare', () => {
  it('gives the change in whole percent', () => {
    expect(compare(7500, 6000)).toEqual({ kind: 'up', percent: 25 })
    expect(compare(135, 150)).toEqual({ kind: 'down', percent: 10 })
    expect(compare(90, 90)).toEqual({ kind: 'same' })
  })

  it('has nothing to compare with when the earlier figure is missing or zero', () => {
    expect(compare(500, 0)).toEqual({ kind: 'none' })
    expect(compare(120, null)).toEqual({ kind: 'none' })
    expect(compare(null, 120)).toEqual({ kind: 'none' })
  })
})

describe('splitMinutes', () => {
  it('splits into hours and minutes', () => {
    expect(splitMinutes(135)).toEqual({ hours: 2, minutes: 15 })
    expect(splitMinutes(45)).toEqual({ hours: 0, minutes: 45 })
    expect(splitMinutes(120)).toEqual({ hours: 2, minutes: 0 })
  })

  it('rounds and never goes below zero', () => {
    expect(splitMinutes(59.6)).toEqual({ hours: 1, minutes: 0 })
    expect(splitMinutes(-5)).toEqual({ hours: 0, minutes: 0 })
  })
})
