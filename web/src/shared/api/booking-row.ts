import { z } from 'zod'

/*
 * One booking in a garage's list, as the admin garage page and the owner's
 * dashboard both receive it (GarageBookingRow in
 * backend/src/parking/garage-stats.service.ts). No phone or email.
 */

const isoDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value))

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const
/** 'walk_in': a car that parked without the app, started from the Garage Portal. */
export const BOOKING_SOURCES = ['app', 'walk_in'] as const

export const bookingRowSchema = z.object({
  id: z.number().int(),
  source: z.enum(BOOKING_SOURCES),
  status: z.enum(BOOKING_STATUSES),
  /** Completed before its booked end time. */
  ended_early: z.boolean(),
  start_time: isoDate,
  /** null while a walk-in is still parked. */
  end_time: isoDate.nullable(),
  /** A walk-in: 0 until it leaves and pays. */
  total_cost: z.number(),
  /** Hours paid for (booked, or a walk-in's charged hours); 0 while a walk-in is parked. */
  duration_hours: z.number().int(),
  customer: z.object({ id: z.number().int(), name: z.string() }).nullable(),
  vehicle: z.object({ brand: z.string(), model: z.string(), license_plate: z.string() }).nullable(),
  /** A walk-in's plate. */
  plate: z.string().nullable(),
  slot: z.object({ level: z.string(), slot_number: z.string() }).nullable(),
})
export type BookingRow = z.infer<typeof bookingRowSchema>
