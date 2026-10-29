import { describe, expect, it } from 'vitest'

import {
  createGarageFormSchema,
  dailyCapErrors,
  emptyGarageForm,
  fieldsOf,
  formFromGarage,
  nextLevel,
  parseCoordinates,
  stepOf,
  stepsFor,
  toCreateBody,
  toUpdateBody,
  totalSlots,
  type FormMessage,
  type GarageFormValues,
} from './garage-form'
import type { GarageDetail } from './garage.schemas'

/** Messages are just their keys here, so tests can check which rule failed. */
const message: FormMessage = (key) => key

function filled(overrides: Partial<GarageFormValues> = {}): GarageFormValues {
  return {
    ...emptyGarageForm(),
    name: ' Duhok Gate Parking ',
    address: 'Kawa Avenue',
    city: 'Duhok',
    coordinates: '36.8667, 42.9881',
    price_per_hour: 1000,
    levels: [
      { level: 'g', slots: 3 },
      { level: 'B1', slots: 2 },
    ],
    ...overrides,
  }
}

/** Failing field paths, e.g. "levels.1.level" -> its message key. */
function errors(values: GarageFormValues, mode: 'create' | 'edit' = 'create') {
  const result = createGarageFormSchema(message, mode, values.withOwner).safeParse(values)
  // The form shows the first message for each field.
  const first: Record<string, string> = {}
  for (const issue of result.error?.issues ?? []) first[issue.path.join('.')] ??= issue.message
  return first
}

const GARAGE: GarageDetail = {
  id: 5,
  name: 'City Center Parking',
  address: 'Salim Street',
  city: 'Sulaymaniyah',
  status: 'approved',
  rating: 4.6,
  latitude: 35.5571,
  longitude: 45.4356,
  price_per_hour: 1500,
  daily_cap: null,
  is_open_24h: false,
  opening_time: '08:00',
  closing_time: '22:00',
  free_cancellation_minutes: 30,
  amenities: { cctv: true, ev_charging: false, covered: true, accessible: false },
  owner: null,
  created_at: new Date('2026-01-15T09:00:00Z'),
  slots: { total: 0, taken: 0, levels: [] },
  revenue: { last_30_days: 0, previous_30_days: 0 },
  recent_bookings: [],
}

describe('parseCoordinates', () => {
  it('reads what map apps copy', () => {
    expect(parseCoordinates('35.5571, 45.4356')).toEqual({ latitude: 35.5571, longitude: 45.4356 })
    expect(parseCoordinates(' 35.5571,45.4356 ')).toEqual({ latitude: 35.5571, longitude: 45.4356 })
    expect(parseCoordinates('35.5571 45.4356')).toEqual({ latitude: 35.5571, longitude: 45.4356 })
    expect(parseCoordinates('-33.9, 151.2')).toEqual({ latitude: -33.9, longitude: 151.2 })
  })

  it('refuses anything else', () => {
    for (const text of ['', '35.5571', 'abc, def', '95, 45', '35, 190', '35.5,45.4,1']) {
      expect(parseCoordinates(text)).toBeNull()
    }
  })
})

describe('createGarageFormSchema', () => {
  it('accepts a complete new garage', () => {
    expect(errors(filled())).toEqual({})
  })

  it('names each field to fix', () => {
    expect(
      errors(
        filled({
          name: 'ab',
          city: '  ',
          coordinates: 'somewhere',
          price_per_hour: undefined,
          free_cancellation_minutes: 90,
          opening_time: '8am',
        }),
      ),
    ).toEqual({
      name: 'minLength',
      city: 'required',
      coordinates: 'coordinates',
      price_per_hour: 'required',
      free_cancellation_minutes: 'atMost',
      opening_time: 'time',
    })
  })

  it('checks every level, and each level only once', () => {
    expect(
      errors(
        filled({
          levels: [
            { level: 'G', slots: 0 },
            { level: 'X1', slots: 2.5 },
            { level: ' g ', slots: 201 },
          ],
        }),
      ),
    ).toEqual({
      'levels.0.slots': 'atLeast',
      'levels.1.level': 'level',
      'levels.1.slots': 'wholeNumber',
      'levels.2.level': 'levelTwice',
      'levels.2.slots': 'atMost',
    })
  })

  it('checks the owner only when one is being added', () => {
    const owner = { name: 'H', email: 'not-an-email', phone: '12' }
    expect(errors(filled({ withOwner: false, owner }))).toEqual({})
    expect(errors(filled({ withOwner: true, owner }))).toEqual({
      'owner.name': 'minLength',
      'owner.email': 'email',
      'owner.phone': 'phone',
    })
  })

  it('ignores levels and owner when editing', () => {
    expect(errors(filled({ levels: [], withOwner: true }), 'edit')).toEqual({})
  })
})

describe('toCreateBody', () => {
  it('builds the request the backend expects', () => {
    expect(toCreateBody(filled())).toEqual({
      name: 'Duhok Gate Parking',
      address: 'Kawa Avenue',
      city: 'Duhok',
      latitude: 36.8667,
      longitude: 42.9881,
      price_per_hour: 1000,
      daily_cap: null,
      free_cancellation_minutes: 30,
      is_open_24h: false,
      opening_time: '08:00',
      closing_time: '22:00',
      has_cctv: false,
      has_ev_charging: false,
      is_covered: false,
      is_accessible: false,
      levels: [
        { level: 'G', slots: 3 },
        { level: 'B1', slots: 2 },
      ],
    })
  })

  it('adds the owner only when asked, with a lower-case email', () => {
    const owner = { name: ' Aram Jalal ', email: ' Aram@Example.com ', phone: '0750 333 4455 ' }
    expect(toCreateBody(filled({ owner })).owner).toBeUndefined()
    expect(toCreateBody(filled({ withOwner: true, owner })).owner).toEqual({
      name: 'Aram Jalal',
      email: 'aram@example.com',
      phone: '0750 333 4455',
    })
  })
})

describe('toUpdateBody', () => {
  it('sends only what changed', () => {
    const values = formFromGarage(GARAGE)
    expect(toUpdateBody(values, GARAGE)).toEqual({})

    values.name = 'City Center Parking (North)'
    values.price_per_hour = 1750
    values.has_ev_charging = true
    values.coordinates = '35.5571,45.4356' // same point, typed differently
    expect(toUpdateBody(values, GARAGE)).toEqual({
      name: 'City Center Parking (North)',
      price_per_hour: 1750,
      has_ev_charging: true,
    })
  })
})

describe('daily cap', () => {
  it('is checked only when switched on, against the price', () => {
    const values = filled()
    expect(dailyCapErrors(values, message)).toEqual([])
    values.has_daily_cap = true
    expect(dailyCapErrors(values, message)).toEqual([{ name: 'daily_cap', message: 'required' }])
    values.daily_cap = 500
    expect(dailyCapErrors(values, message)).toEqual([
      { name: 'daily_cap', message: 'capBelowPrice' },
    ])
    values.daily_cap = 6000
    expect(dailyCapErrors(values, message)).toEqual([])
    expect(toCreateBody(values).daily_cap).toBe(6000)
  })

  it('sends null when switched off, and only when it changed', () => {
    const values = formFromGarage({ ...GARAGE, daily_cap: 9000 })
    expect(values).toMatchObject({ has_daily_cap: true, daily_cap: 9000 })
    expect(toUpdateBody(values, { ...GARAGE, daily_cap: 9000 })).toEqual({})
    values.has_daily_cap = false
    expect(toUpdateBody(values, { ...GARAGE, daily_cap: 9000 })).toEqual({ daily_cap: null })
  })
})

describe('levels', () => {
  it('suggests the ground floor first, then the next free basement', () => {
    expect(nextLevel([])).toBe('G')
    expect(nextLevel([{ level: 'g', slots: 1 }])).toBe('B1')
    expect(
      nextLevel([
        { level: 'G', slots: 1 },
        { level: 'B1', slots: 1 },
        { level: 'B3', slots: 1 },
      ]),
    ).toBe('B2')
  })

  it('adds up only valid slot counts', () => {
    expect(
      totalSlots([
        { level: 'G', slots: 20 },
        { level: 'B1', slots: undefined },
        { level: 'B2', slots: 2.5 },
        { level: 'B3', slots: 5 },
      ]),
    ).toBe(25)
  })
})

describe('form steps', () => {
  it('adds a garage in four steps and edits it in two', () => {
    expect(stepsFor('create')).toEqual(['details', 'pricing', 'levels', 'owner'])
    expect(stepsFor('edit')).toEqual(['details', 'pricing'])
  })

  it('knows which step each field, or error, is on', () => {
    expect(stepOf('coordinates')).toBe('details')
    expect(stepOf('closing_time')).toBe('pricing')
    expect(stepOf('has_ev_charging')).toBe('pricing')
    expect(stepOf('levels.2.slots')).toBe('levels')
    expect(stepOf('owner.email')).toBe('owner')
  })

  it("lists a step's fields, including one pair per level", () => {
    const values = filled()
    expect(fieldsOf('details', values)).toEqual(['name', 'address', 'city', 'coordinates'])
    expect(fieldsOf('levels', values)).toEqual([
      'levels',
      'levels.0.level',
      'levels.0.slots',
      'levels.1.level',
      'levels.1.slots',
    ])
    for (const step of stepsFor('create')) {
      for (const field of fieldsOf(step, values)) expect(stepOf(field)).toBe(step)
    }
  })
})
