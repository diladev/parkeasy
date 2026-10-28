import { z } from 'zod'

import type { LotSettings, PriceOverride } from './portal.schemas'

/*
 * The Lot Settings page. Rules match the backend
 * (garage-portal/dtos/lot-settings.dto.ts and parking/price-settings.ts), so
 * mistakes show next to the field before anything is sent.
 */

/** "HH:mm", 24-hour clock. */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000

export const MAX_FREE_CANCELLATION_MINUTES = 60
/** Special prices a lot can have coming up at once. */
export const MAX_PRICE_OVERRIDES = 20
/** Longest special price, in days. */
export const MAX_OVERRIDE_DAYS = 31

export interface PriceOverrideValues {
  label: string
  start_date: string
  end_date: string
  price_per_hour: number | undefined
  /** Blank: no cap on these days. */
  daily_cap: number | undefined
}

export interface LotSettingsValues {
  name: string
  address: string
  city: string
  price_per_hour: number | undefined
  has_daily_cap: boolean
  daily_cap: number | undefined
  free_cancellation_minutes: number | undefined
  is_open_24h: boolean
  opening_time: string
  closing_time: string
  has_cctv: boolean
  has_ev_charging: boolean
  is_covered: boolean
  is_accessible: boolean
  price_overrides: PriceOverrideValues[]
}

/** PUT /garage/garages/:id/settings */
export interface LotSettingsBody {
  name: string
  address: string
  city: string
  price_per_hour: number
  daily_cap: number | null
  free_cancellation_minutes: number
  is_open_24h: boolean
  opening_time: string
  closing_time: string
  has_cctv: boolean
  has_ev_charging: boolean
  is_covered: boolean
  is_accessible: boolean
  price_overrides: {
    label: string
    start_date: string
    end_date: string
    price_per_hour: number
    daily_cap: number | null
  }[]
}

export function overrideValues(rule: Omit<PriceOverride, 'id'>): PriceOverrideValues {
  return {
    label: rule.label,
    start_date: rule.start_date,
    end_date: rule.end_date,
    price_per_hour: rule.price_per_hour,
    daily_cap: rule.daily_cap ?? undefined,
  }
}

export function formFromSettings(settings: LotSettings): LotSettingsValues {
  return {
    name: settings.name,
    address: settings.address,
    city: settings.city,
    price_per_hour: settings.price_per_hour,
    has_daily_cap: settings.daily_cap !== null,
    daily_cap: settings.daily_cap ?? undefined,
    free_cancellation_minutes: settings.free_cancellation_minutes,
    is_open_24h: settings.is_open_24h,
    opening_time: settings.opening_time,
    closing_time: settings.closing_time,
    has_cctv: settings.has_cctv,
    has_ev_charging: settings.has_ev_charging,
    is_covered: settings.is_covered,
    is_accessible: settings.is_accessible,
    price_overrides: settings.price_overrides.map(overrideValues),
  }
}

export function toSettingsBody(values: LotSettingsValues): LotSettingsBody {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    price_per_hour: values.price_per_hour ?? 0,
    daily_cap: values.has_daily_cap ? (values.daily_cap ?? null) : null,
    free_cancellation_minutes: values.free_cancellation_minutes ?? 0,
    is_open_24h: values.is_open_24h,
    opening_time: values.opening_time,
    closing_time: values.closing_time,
    has_cctv: values.has_cctv,
    has_ev_charging: values.has_ev_charging,
    is_covered: values.is_covered,
    is_accessible: values.is_accessible,
    price_overrides: sortOverrides(values.price_overrides).map((rule) => ({
      label: rule.label.trim(),
      start_date: rule.start_date,
      end_date: rule.end_date,
      price_per_hour: rule.price_per_hour ?? 0,
      daily_cap: rule.daily_cap ?? null,
    })),
  }
}

/** Soonest first, as the server lists them. */
export function sortOverrides<T extends { start_date: string }>(rules: readonly T[]): T[] {
  return [...rules].sort((a, b) => a.start_date.localeCompare(b.start_date))
}

/** Changed from what was loaded? Compared as they would be sent, so "  x" and "x" are the same. */
export function settingsChanged(values: LotSettingsValues, settings: LotSettings): boolean {
  return (
    JSON.stringify(toSettingsBody(values)) !==
    JSON.stringify(toSettingsBody(formFromSettings(settings)))
  )
}

// ----------------------------------------------------------------- dates

/** Days from `start` to `end`, both included: "2027-03-20" to "2027-03-22" is 3. */
export function daysInRange(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS) + 1
}

/** "2026-10-28" plus `days` days. */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10)
}

const isRealDate = (value: string) =>
  DATE_PATTERN.test(value) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value)

/** True while `rule` covers `today`. */
export const isRunning = (rule: { start_date: string; end_date: string }, today: string) =>
  rule.start_date <= today && today <= rule.end_date

/**
 * What a cap means in hours: "stays of 6 hours or more cost 9,000". null when
 * there's no cap, or the price is 0 (then nothing ever reaches it).
 */
export function hoursToCap(price: number | undefined, cap: number | undefined): number | null {
  if (!price || price <= 0 || cap === undefined || cap < price) return null
  return Math.ceil(cap / price)
}

// ---------------------------------------------------------------- schemas

/** Translations the schemas need; passed in so they follow the current language. */
export type SettingsMessage = (
  key:
    | 'required'
    | 'minLength'
    | 'wholeNumber'
    | 'atLeast'
    | 'atMost'
    | 'time'
    | 'date'
    | 'capBelowPrice'
    | 'endBeforeStart'
    | 'ended'
    | 'tooLong'
    | 'overlap',
  params?: Record<string, string | number>,
) => string

function fields(message: SettingsMessage) {
  const text = (min: number, max: number) =>
    z
      .string()
      .trim()
      .min(1, { error: message('required') })
      .min(min, { error: message('minLength', { min }) })
      .max(max)

  const wholeNumber = (min: number, max?: number) => {
    let schema = z
      .number({ error: message('required') })
      .int({ error: message('wholeNumber') })
      .min(min, { error: message('atLeast', { min }) })
    if (max !== undefined) schema = schema.max(max, { error: message('atMost', { max }) })
    return schema
  }

  return { text, wholeNumber }
}

/** A message for one field, as UForm's `validate` takes them. */
export interface FieldError {
  name: string
  message: string
}

const isWholeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)

/**
 * The page's own fields. The daily cap is checked by checkDailyCap (it
 * depends on the price), and special prices in their dialog, one at a time.
 */
export function createSettingsSchema(message: SettingsMessage) {
  const { text, wholeNumber } = fields(message)
  const time = z.string().regex(TIME_PATTERN, { error: message('time') })

  return z.object({
    name: text(3, 100),
    address: text(3, 255),
    city: text(2, 100),
    price_per_hour: wholeNumber(0),
    has_daily_cap: z.boolean(),
    daily_cap: z.unknown(),
    free_cancellation_minutes: wholeNumber(0, MAX_FREE_CANCELLATION_MINUTES),
    is_open_24h: z.boolean(),
    opening_time: time,
    closing_time: time,
    has_cctv: z.boolean(),
    has_ev_charging: z.boolean(),
    is_covered: z.boolean(),
    is_accessible: z.boolean(),
    price_overrides: z.array(z.unknown()).max(MAX_PRICE_OVERRIDES),
  })
}

/** A cap must be a whole amount, and at least one hour's price. */
function capError(
  cap: unknown,
  price: unknown,
  required: boolean,
  message: SettingsMessage,
): string | null {
  if (cap === undefined || cap === null || cap === '') return required ? message('required') : null
  if (!isWholeNumber(cap)) return message('wholeNumber')
  if (cap < 0) return message('atLeast', { min: 0 })
  if (isWholeNumber(price) && cap < price) return message('capBelowPrice')
  return null
}

/** The page's daily cap, when it's switched on. Checked with the other fields, every time. */
export function checkDailyCap(values: LotSettingsValues, message: SettingsMessage): FieldError[] {
  if (!values.has_daily_cap) return []
  const error = capError(values.daily_cap, values.price_per_hour, true, message)
  return error ? [{ name: 'daily_cap', message: error }] : []
}

/** One special price's fields, each on its own. */
export function createOverrideSchema(message: SettingsMessage) {
  const { text, wholeNumber } = fields(message)
  const date = z
    .string()
    .min(1, { error: message('required') })
    .refine(isRealDate, { error: message('date') })

  return z.object({
    label: text(2, 60),
    start_date: date,
    end_date: date,
    price_per_hour: wholeNumber(0),
    daily_cap: z.unknown(),
  })
}

/**
 * One special price against its own dates and the others. `today` is the
 * server's day; `others` are the special prices already in the list (without
 * the one being edited): two can't share a day.
 */
export function checkOverride(
  rule: PriceOverrideValues,
  today: string,
  others: readonly PriceOverrideValues[],
  message: SettingsMessage,
): FieldError[] {
  const errors: FieldError[] = []
  const cap = capError(rule.daily_cap, rule.price_per_hour, false, message)
  if (cap) errors.push({ name: 'daily_cap', message: cap })

  if (!isRealDate(rule.start_date) || !isRealDate(rule.end_date)) return errors
  if (rule.end_date < rule.start_date) {
    errors.push({ name: 'end_date', message: message('endBeforeStart') })
  } else if (rule.end_date < today) {
    errors.push({ name: 'end_date', message: message('ended') })
  } else if (daysInRange(rule.start_date, rule.end_date) > MAX_OVERRIDE_DAYS) {
    errors.push({ name: 'end_date', message: message('tooLong', { max: MAX_OVERRIDE_DAYS }) })
  } else {
    const clash = others.find(
      (other) => other.start_date <= rule.end_date && rule.start_date <= other.end_date,
    )
    if (clash)
      errors.push({ name: 'start_date', message: message('overlap', { label: clash.label }) })
  }
  return errors
}
