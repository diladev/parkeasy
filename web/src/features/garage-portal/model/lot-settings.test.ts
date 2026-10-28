import { describe, expect, it } from 'vitest'

import {
  addDays,
  checkDailyCap,
  checkOverride,
  createOverrideSchema,
  createSettingsSchema,
  daysInRange,
  formFromSettings,
  hoursToCap,
  isRunning,
  settingsChanged,
  toSettingsBody,
  type PriceOverrideValues,
  type SettingsMessage,
} from './lot-settings'
import type { LotSettings } from './portal.schemas'

const message: SettingsMessage = (key, params) =>
  params ? `${key}:${Object.values(params).join('|')}` : key

const TODAY = '2026-10-28'
const SETTINGS: LotSettings = {
  id: 5,
  status: 'approved',
  name: 'City Center Parking',
  address: 'Salim Street, Sulaymaniyah',
  city: 'Sulaymaniyah',
  is_open_24h: true,
  opening_time: '00:00',
  closing_time: '00:00',
  price_per_hour: 1500,
  daily_cap: 9000,
  free_cancellation_minutes: 30,
  has_cctv: true,
  has_ev_charging: false,
  is_covered: true,
  is_accessible: true,
  total_slots: 30,
  price_overrides: [
    {
      id: 1,
      label: 'Newroz',
      start_date: '2027-03-20',
      end_date: '2027-03-22',
      price_per_hour: 2500,
      daily_cap: null,
    },
  ],
  today: TODAY,
}

const eid: PriceOverrideValues = {
  label: 'Eid',
  start_date: '2026-11-10',
  end_date: '2026-11-12',
  price_per_hour: 2500,
  daily_cap: 15000,
}

describe('form <-> request', () => {
  it('loads the settings and sends them back unchanged', () => {
    const values = formFromSettings(SETTINGS)
    expect(values).toMatchObject({ has_daily_cap: true, daily_cap: 9000 })
    expect(values.price_overrides[0]).toEqual({
      label: 'Newroz',
      start_date: '2027-03-20',
      end_date: '2027-03-22',
      price_per_hour: 2500,
      daily_cap: undefined,
    })
    expect(toSettingsBody(values)).toMatchObject({
      daily_cap: 9000,
      price_overrides: [{ label: 'Newroz', daily_cap: null }],
    })
    expect(settingsChanged(values, SETTINGS)).toBe(false)
  })

  it('sends no cap when it is switched off, trims text and sorts special prices', () => {
    const values = formFromSettings(SETTINGS)
    values.has_daily_cap = false
    values.name = '  City Center  '
    values.price_overrides.push({ ...eid, label: ' Eid ' })
    const body = toSettingsBody(values)
    expect(body.daily_cap).toBeNull()
    expect(body.name).toBe('City Center')
    expect(body.price_overrides.map((rule) => rule.label)).toEqual(['Eid', 'Newroz'])
    expect(settingsChanged(values, SETTINGS)).toBe(true)
  })

  it('treats whitespace-only edits as no change', () => {
    const values = formFromSettings(SETTINGS)
    values.address = `${SETTINGS.address}  `
    expect(settingsChanged(values, SETTINGS)).toBe(false)
  })
})

describe('the page schema and daily cap', () => {
  const schema = createSettingsSchema(message)

  it('accepts the loaded settings', () => {
    expect(schema.safeParse(formFromSettings(SETTINGS)).success).toBe(true)
  })

  it('checks each field', () => {
    const values = { ...formFromSettings(SETTINGS), name: 'ab', free_cancellation_minutes: 90 }
    const issues = schema.safeParse(values).error?.issues.map((issue) => issue.path.join('.'))
    expect(issues).toEqual(['name', 'free_cancellation_minutes'])
  })

  it("needs a cap of at least one hour's price, only when it is on", () => {
    const values = formFromSettings(SETTINGS)
    expect(checkDailyCap(values, message)).toEqual([])
    expect(checkDailyCap({ ...values, daily_cap: 1000 }, message)).toEqual([
      { name: 'daily_cap', message: 'capBelowPrice' },
    ])
    expect(checkDailyCap({ ...values, daily_cap: undefined }, message)).toEqual([
      { name: 'daily_cap', message: 'required' },
    ])
    expect(checkDailyCap({ ...values, daily_cap: 1000.5 }, message)).toEqual([
      { name: 'daily_cap', message: 'wholeNumber' },
    ])
    expect(checkDailyCap({ ...values, has_daily_cap: false, daily_cap: 1 }, message)).toEqual([])
  })
})

describe('special prices', () => {
  const schema = createOverrideSchema(message)
  const check = (rule: Partial<PriceOverrideValues>, others: PriceOverrideValues[] = []) =>
    checkOverride({ ...eid, ...rule }, TODAY, others, message)

  it('accepts a sensible one, with or without a cap', () => {
    expect(schema.safeParse(eid).success).toBe(true)
    expect(check({})).toEqual([])
    expect(check({ daily_cap: undefined })).toEqual([])
    // Running now: started before today.
    expect(check({ start_date: '2026-10-26', end_date: TODAY })).toEqual([])
  })

  it('needs a name, real dates and a price', () => {
    const issues = schema
      .safeParse({ ...eid, label: '', start_date: '2026-02-30', price_per_hour: undefined })
      .error?.issues.map((issue) => `${issue.path.join('.')}:${issue.message}`)
    // The first message per field is the one shown.
    const first = issues?.filter(
      (issue, index) =>
        issues.findIndex((other) => other.split(':')[0] === issue.split(':')[0]) === index,
    )
    expect(first).toEqual(['label:required', 'start_date:date', 'price_per_hour:required'])
  })

  it('refuses backwards, finished or too long ranges', () => {
    expect(check({ start_date: '2026-11-12', end_date: '2026-11-10' })).toEqual([
      { name: 'end_date', message: 'endBeforeStart' },
    ])
    expect(check({ start_date: '2026-10-01', end_date: '2026-10-27' })).toEqual([
      { name: 'end_date', message: 'ended' },
    ])
    expect(check({ start_date: '2026-11-01', end_date: '2026-12-02' })).toEqual([
      { name: 'end_date', message: 'tooLong:31' },
    ])
  })

  it('refuses a cap below its hourly price, and a day another special price has', () => {
    expect(check({ daily_cap: 2000 })).toEqual([{ name: 'daily_cap', message: 'capBelowPrice' }])
    const newroz = { ...eid, label: 'Newroz', start_date: '2026-11-12', end_date: '2026-11-14' }
    expect(check({}, [newroz])).toEqual([{ name: 'start_date', message: 'overlap:Newroz' }])
    expect(check({}, [{ ...newroz, start_date: '2026-11-13' }])).toEqual([])
  })
})

describe('helpers', () => {
  it('counts days with both ends, and adds days', () => {
    expect(daysInRange('2027-03-20', '2027-03-22')).toBe(3)
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(isRunning(eid, '2026-11-12')).toBe(true)
    expect(isRunning(eid, '2026-11-13')).toBe(false)
  })

  it('says how many hours reach the cap', () => {
    expect(hoursToCap(1500, 9000)).toBe(6)
    expect(hoursToCap(1500, 10000)).toBe(7)
    expect(hoursToCap(1500, undefined)).toBeNull()
    expect(hoursToCap(0, 9000)).toBeNull()
    expect(hoursToCap(1500, 1000)).toBeNull()
  })
})
