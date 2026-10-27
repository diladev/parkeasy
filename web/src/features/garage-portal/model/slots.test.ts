import { describe, expect, it } from 'vitest'

import type { LiveSlot } from './portal.schemas'
import { countByStatus, slotActionFor } from './slots'

const slot = (status: LiveSlot['status'], booked = false): LiveSlot => ({
  id: 1,
  level: 'G',
  slot_number: 'A01',
  status,
  booking: booked
    ? {
        id: 9,
        start_time: new Date(),
        end_time: new Date(),
        total_cost: 1500,
        payment_method: 'wallet',
        customer: null,
        vehicle: null,
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

describe('slotActionFor', () => {
  it('offers what the server allows', () => {
    expect(slotActionFor(slot('free'))).toEqual({ action: 'block', label: 'block' })
    expect(slotActionFor(slot('blocked'))).toEqual({ action: 'release', label: 'unblock' })
    expect(slotActionFor(slot('occupied'))).toEqual({ action: 'release', label: 'markFree' })
  })

  it('offers nothing for a booked slot', () => {
    expect(slotActionFor(slot('reserved', true))).toBeNull()
    // Even if a sensor one day marks a booked car "occupied".
    expect(slotActionFor(slot('occupied', true))).toBeNull()
  })
})
