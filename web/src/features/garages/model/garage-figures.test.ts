import { describe, expect, it } from 'vitest'

import { mapLink, revenueChange } from './garage-figures'

describe('garage figures', () => {
  it('compares revenue only when there is something to compare with', () => {
    expect(revenueChange(7500, 3000)).toBe(150)
    expect(revenueChange(1500, 3000)).toBe(-50)
    expect(revenueChange(1500, 0)).toBeNull()
  })

  it('links to the spot on OpenStreetMap', () => {
    expect(mapLink(35.5571, 45.4356)).toBe(
      'https://www.openstreetmap.org/?mlat=35.5571&mlon=45.4356#map=17/35.5571/45.4356',
    )
  })
})
