import { z } from 'zod'

import type { GarageDetail } from './garage.schemas'

/*
 * The Add garage / Edit details form. Rules match the backend DTOs
 * (backend/src/parking/dtos/create-parking-lot.dto.ts, admin-create-garage.dto.ts),
 * so most mistakes are caught before the request is sent.
 */

/** "HH:mm", 24-hour clock. */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
/** B1, B2... (basements), G (ground), F1, F2... (floors). */
export const LEVEL_PATTERN = /^(B[1-9]\d*|G|F[1-9]\d*)$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/

export const MAX_LEVELS = 10
export const MAX_SLOTS_PER_LEVEL = 200
export const MAX_FREE_CANCELLATION_MINUTES = 60

export interface GarageLevelValues {
  level: string
  slots: number | undefined
}

export interface GarageFormValues {
  name: string
  address: string
  city: string
  /** One box for both, as copied from a map: "35.5571, 45.4356". */
  coordinates: string
  price_per_hour: number | undefined
  free_cancellation_minutes: number | undefined
  is_open_24h: boolean
  opening_time: string
  closing_time: string
  has_cctv: boolean
  has_ev_charging: boolean
  is_covered: boolean
  is_accessible: boolean
  /** Add garage only: levels, slots and the owner are managed elsewhere afterwards. */
  levels: GarageLevelValues[]
  withOwner: boolean
  owner: { name: string; email: string; phone: string }
}

/** The lot's own fields, as both endpoints take them. */
export interface GarageDetailsBody {
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  price_per_hour: number
  free_cancellation_minutes: number
  is_open_24h: boolean
  opening_time: string
  closing_time: string
  has_cctv: boolean
  has_ev_charging: boolean
  is_covered: boolean
  is_accessible: boolean
}

/** POST /admin/garages */
export interface CreateGarageBody extends GarageDetailsBody {
  levels: { level: string; slots: number }[]
  owner?: { name: string; email: string; phone: string }
}

/** PATCH /admin/garages/:id: only what changed. */
export type UpdateGarageBody = Partial<GarageDetailsBody>

/** "35.5571, 45.4356" (also with spaces only, or a semicolon) -> { latitude, longitude } */
export function parseCoordinates(text: string): { latitude: number; longitude: number } | null {
  const match = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(text)
  if (!match) return null
  const latitude = Number(match[1])
  const longitude = Number(match[2])
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude}, ${longitude}`
}

export function emptyGarageForm(): GarageFormValues {
  return {
    name: '',
    address: '',
    city: '',
    coordinates: '',
    price_per_hour: undefined,
    free_cancellation_minutes: 30,
    is_open_24h: false,
    opening_time: '08:00',
    closing_time: '22:00',
    has_cctv: false,
    has_ev_charging: false,
    is_covered: false,
    is_accessible: false,
    levels: [{ level: 'G', slots: undefined }],
    withOwner: false,
    owner: { name: '', email: '', phone: '' },
  }
}

export function formFromGarage(garage: GarageDetail): GarageFormValues {
  return {
    ...emptyGarageForm(),
    name: garage.name,
    address: garage.address,
    city: garage.city,
    coordinates: formatCoordinates(garage.latitude, garage.longitude),
    price_per_hour: garage.price_per_hour,
    free_cancellation_minutes: garage.free_cancellation_minutes,
    is_open_24h: garage.is_open_24h,
    opening_time: garage.opening_time,
    closing_time: garage.closing_time,
    has_cctv: garage.amenities.cctv,
    has_ev_charging: garage.amenities.ev_charging,
    is_covered: garage.amenities.covered,
    is_accessible: garage.amenities.accessible,
    levels: [],
  }
}

function detailsBody(values: GarageFormValues): GarageDetailsBody {
  const point = parseCoordinates(values.coordinates)
  if (!point) throw new Error('Validate the form before building the request.')
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    latitude: point.latitude,
    longitude: point.longitude,
    price_per_hour: values.price_per_hour ?? 0,
    free_cancellation_minutes: values.free_cancellation_minutes ?? 0,
    is_open_24h: values.is_open_24h,
    opening_time: values.opening_time,
    closing_time: values.closing_time,
    has_cctv: values.has_cctv,
    has_ev_charging: values.has_ev_charging,
    is_covered: values.is_covered,
    is_accessible: values.is_accessible,
  }
}

export function toCreateBody(values: GarageFormValues): CreateGarageBody {
  return {
    ...detailsBody(values),
    levels: values.levels.map(({ level, slots }) => ({
      level: normalizeLevel(level),
      slots: slots ?? 0,
    })),
    ...(values.withOwner && {
      owner: {
        name: values.owner.name.trim(),
        email: values.owner.email.trim().toLowerCase(),
        phone: values.owner.phone.trim(),
      },
    }),
  }
}

/** Only the fields that differ from the garage as loaded; {} when nothing changed. */
export function toUpdateBody(values: GarageFormValues, original: GarageDetail): UpdateGarageBody {
  const next = detailsBody(values)
  const before = detailsBody(formFromGarage(original))
  const changed = Object.entries(next).filter(
    ([key, value]) => value !== before[key as keyof GarageDetailsBody],
  )
  return Object.fromEntries(changed)
}

/** " b1 " -> "B1" */
export const normalizeLevel = (level: string) => level.trim().toUpperCase()

export function totalSlots(levels: GarageLevelValues[]): number {
  return levels.reduce(
    (sum, { slots }) => sum + (typeof slots === 'number' && Number.isInteger(slots) ? slots : 0),
    0,
  )
}

/** Translations the schema needs; passed in so they follow the current language. */
export type FormMessage = (
  key:
    | 'required'
    | 'minLength'
    | 'coordinates'
    | 'wholeNumber'
    | 'atLeast'
    | 'atMost'
    | 'time'
    | 'level'
    | 'levelTwice'
    | 'email'
    | 'phone',
  params?: Record<string, number>,
) => string

/**
 * The form's rules. Levels and owner are only checked when adding a garage
 * (editing leaves them out of the request), and the owner only when one is
 * being added, so the schema is rebuilt when that switch changes.
 */
export function createGarageFormSchema(
  message: FormMessage,
  mode: 'create' | 'edit',
  withOwner = false,
) {
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

  const time = z.string().regex(TIME_PATTERN, { error: message('time') })

  const level = z.object({
    level: z
      .string()
      .trim()
      .toUpperCase()
      .regex(LEVEL_PATTERN, { error: message('level') }),
    slots: wholeNumber(1, MAX_SLOTS_PER_LEVEL),
  })

  const owner = z.object({
    name: text(2, 60),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: message('email') })),
    phone: z
      .string()
      .trim()
      .regex(PHONE_PATTERN, { error: message('phone') }),
  })

  // Each level is checked on its own, and also against the others ("b1" and
  // "B1" are the same level), so all mistakes show at once.
  const levels = z
    .array(z.unknown())
    .min(1)
    .max(MAX_LEVELS)
    .superRefine((entries, context) => {
      const seen = new Set<string>()
      entries.forEach((entry, index) => {
        for (const issue of level.safeParse(entry).error?.issues ?? []) {
          context.addIssue({ code: 'custom', path: [index, ...issue.path], message: issue.message })
        }
        const name = normalizeLevel((entry as GarageLevelValues).level)
        if (seen.has(name)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'level'],
            message: message('levelTwice'),
          })
        }
        seen.add(name)
      })
    })

  return z.object({
    name: text(3, 100),
    address: text(3, 255),
    city: text(2, 100),
    coordinates: z
      .string()
      .refine((value) => parseCoordinates(value) !== null, { error: message('coordinates') }),
    price_per_hour: wholeNumber(0),
    free_cancellation_minutes: wholeNumber(0, MAX_FREE_CANCELLATION_MINUTES),
    is_open_24h: z.boolean(),
    opening_time: time,
    closing_time: time,
    has_cctv: z.boolean(),
    has_ev_charging: z.boolean(),
    is_covered: z.boolean(),
    is_accessible: z.boolean(),
    levels: mode === 'create' ? levels : z.array(z.unknown()),
    withOwner: z.boolean(),
    owner: mode === 'create' && withOwner ? owner : z.unknown(),
  })
}

/** What "Add level" suggests: G first, then the first free basement (B1, B2...). */
export function nextLevel(levels: GarageLevelValues[]): string {
  const used = new Set(levels.map((entry) => normalizeLevel(entry.level)))
  if (!used.has('G')) return 'G'
  let basement = 1
  while (used.has(`B${basement}`)) basement++
  return `B${basement}`
}
