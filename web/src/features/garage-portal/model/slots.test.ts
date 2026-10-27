import { describe, expect, it } from 'vitest'

import type { LiveSlot } from './portal.schemas'
import { countByStatus, createPlateSchema, minutesSince, situationOf, slotActionFor } from './slots'

const slot = (status: LiveSlot['status'], held: 'app' | 'walk_in' | null = null): LiveSlot => ({
  id: 1,
  level: 'G',
  slot_number: 'A01',
  status,
  booking: held
    ? {
        id: 9,
        source: held,
        start_time: new Date(),
        end_time: held === 'app' ? new Date() : null,
        total_cost: held === 'app' ? 1500 : 0,
        payment_method: held === 'app' ? 'wallet' : 'cash',
        price_per_hour: 1500,
        customer: null,
        vehicle: null,
        plate: held === 'walk_in' ? '22 SUL 1' : null,
        charge_now: held === 'walk_in' ? { hours: 1, amount: 1500 } : null,
      }
    : null,
})

describe('countByStatus', () => {
  it('counts every state, with zeros', () => {
    expect(countByStatus([slot('free'), slot('free'), slot('blocked')])).toEqual({
      free: 2,
      reserved: 0,
      occupied: 0,
      blocked: 1,
    })
  })
})

describe('situationOf', () => {
  it('tells a walk-in from an app booking and from an unrecorded car', () => {
    expect(situationOf(slot('reserved', 'app'))).toBe('booked')
    expect(situationOf(slot('occupied', 'walk_in'))).toBe('walk-in')
    expect(situationOf(slot('occupied'))).toBe('occupied')
    expect(situationOf(slot('free'))).toBe('free')
    expect(situationOf(slot('blocked'))).toBe('blocked')
  })
})

describe('slotActionFor', () => {
  it('offers what the server allows', () => {
    expect(slotActionFor(slot('free'))).toEqual({ action: 'block', label: 'block' })
    expect(slotActionFor(slot('blocked'))).toEqual({ action: 'release', label: 'unblock' })
    expect(slotActionFor(slot('occupied'))).toEqual({ action: 'release', label: 'markFree' })
  })

  it('offers no block or release while a booking or a walk-in holds the slot', () => {
    expect(slotActionFor(slot('reserved', 'app'))).toBeNull()
    expect(slotActionFor(slot('occupied', 'walk_in'))).toBeNull()
    // Even if a sensor one day marks a booked car "occupied".
    expect(slotActionFor(slot('occupied', 'app'))).toBeNull()
  })
})

describe('createPlateSchema', () => {
  const schema = createPlateSchema('bad plate')

  it('tidies spaces and letters the way the server does', () => {
    expect(schema.parse({ plate: '  22  sul 4471 ' })).toEqual({ plate: '22 SUL 4471' })
    expect(schema.parse({ plate: 'هەولێر 12' })).toEqual({ plate: 'هەولێر 12' })
  })

  it('refuses what the server would', () => {
    expect(schema.safeParse({ plate: '!' }).success).toBe(false)
    expect(schema.safeParse({ plate: 'A' }).success).toBe(false)
    expect(schema.safeParse({ plate: '1234567890123456' }).success).toBe(false)
  })
})

describe('minutesSince', () => {
  it('counts whole minutes, never negative', () => {
    const start = new Date('2026-10-27T09:00:00Z')
    expect(minutesSince(start, new Date('2026-10-27T10:20:30Z'))).toBe(80)
    expect(minutesSince(start, new Date('2026-10-27T08:00:00Z'))).toBe(0)
  })
})
