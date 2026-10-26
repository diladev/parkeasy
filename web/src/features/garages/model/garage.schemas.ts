import { z } from 'zod'

import { paginated } from '@/shared/api/pagination'

/*
 * Matches backend/src/parking/admin-garages.service.ts (AdminGarageRow,
 * AdminGarageList). Parsed at runtime, so a backend change fails loudly here.
 */

export const GARAGE_STATUSES = ['pending', 'approved', 'suspended'] as const
export const garageStatusSchema = z.enum(GARAGE_STATUSES)
export type GarageStatus = z.infer<typeof garageStatusSchema>

export const garageRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  status: garageStatusSchema,
  /** 0 until drivers have rated it. */
  rating: z.number(),
  total_slots: z.number().int(),
  /** Whole Iraqi dinars, paid bookings that started in the last 30 days. */
  revenue_30d: z.number(),
  owner: z.object({ id: z.number().int(), name: z.string(), email: z.string() }).nullable(),
})
export type GarageRow = z.infer<typeof garageRowSchema>

export const garageCountsSchema = z.object({
  all: z.number().int(),
  pending: z.number().int(),
  approved: z.number().int(),
  suspended: z.number().int(),
})
export type GarageCounts = z.infer<typeof garageCountsSchema>

export const garageListSchema = paginated(garageRowSchema).extend({ counts: garageCountsSchema })
export type GarageList = z.infer<typeof garageListSchema>

export const statusChangeSchema = z.object({
  id: z.number().int(),
  status: garageStatusSchema,
  /** Already translated by the backend. */
  message: z.string(),
})
export type StatusChange = z.infer<typeof statusChangeSchema>

/** POST /admin/garages and PATCH /admin/garages/:id */
export const garageSavedSchema = z.object({
  id: z.number().int(),
  /** Already translated by the backend. */
  message: z.string(),
})
export type GarageSaved = z.infer<typeof garageSavedSchema>

// ------------------------------------------------------------------ detail

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const

/** JSON dates arrive as ISO strings. */
const isoDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value))

export const garageBookingSchema = z.object({
  id: z.number().int(),
  status: z.enum(BOOKING_STATUSES),
  /** Completed before its booked end time. */
  ended_early: z.boolean(),
  start_time: isoDate,
  end_time: isoDate,
  total_cost: z.number(),
  customer: z.object({ id: z.number().int(), name: z.string() }).nullable(),
  vehicle: z.object({ brand: z.string(), model: z.string(), license_plate: z.string() }).nullable(),
  slot: z.object({ level: z.string(), slot_number: z.string() }).nullable(),
})
export type GarageBooking = z.infer<typeof garageBookingSchema>

export const levelOccupancySchema = z.object({
  level: z.string(),
  total: z.number().int(),
  taken: z.number().int(),
})
export type LevelOccupancy = z.infer<typeof levelOccupancySchema>

/** Matches AdminGarageDetail in backend/src/parking/admin-garages.service.ts. */
export const garageDetailSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  status: garageStatusSchema,
  rating: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  price_per_hour: z.number(),
  is_open_24h: z.boolean(),
  opening_time: z.string(),
  closing_time: z.string(),
  free_cancellation_minutes: z.number().int(),
  amenities: z.object({
    cctv: z.boolean(),
    ev_charging: z.boolean(),
    covered: z.boolean(),
    accessible: z.boolean(),
  }),
  owner: z.object({ id: z.number().int(), name: z.string(), email: z.string() }).nullable(),
  created_at: isoDate,
  slots: z.object({
    total: z.number().int(),
    taken: z.number().int(),
    levels: z.array(levelOccupancySchema),
  }),
  revenue: z.object({ last_30_days: z.number(), previous_30_days: z.number() }),
  recent_bookings: z.array(garageBookingSchema),
})
export type GarageDetail = z.infer<typeof garageDetailSchema>
