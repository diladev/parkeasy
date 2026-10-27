import { z } from 'zod'

import { BOOKING_SOURCES, bookingRowSchema } from '@/shared/api/booking-row'

/*
 * Matches backend/src/garage-portal/garage-portal.service.ts (OwnedGarage,
 * GarageDashboard). Parsed at runtime, so a backend change fails loudly here.
 */

const isoDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value))

export const ownedGarageSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  city: z.string(),
  status: z.enum(['pending', 'approved', 'suspended']),
})
export type OwnedGarage = z.infer<typeof ownedGarageSchema>

export const ownedGaragesSchema = z.array(ownedGarageSchema)

export const dashboardSchema = z.object({
  garage: ownedGarageSchema,
  occupancy: z.object({ taken: z.number().int(), total: z.number().int() }),
  revenue_today: z.object({ today: z.number(), yesterday: z.number() }),
  active_bookings: z.object({ active: z.number().int(), ending_soon: z.number().int() }),
  /** Minutes; null when there were no completed stays. */
  average_stay: z.object({
    last_7_days: z.number().nullable(),
    previous_7_days: z.number().nullable(),
  }),
  revenue_days: z.array(z.object({ date: z.iso.date(), amount: z.number() })),
  levels: z.array(
    z.object({ level: z.string(), total: z.number().int(), taken: z.number().int() }),
  ),
  recent_bookings: z.array(bookingRowSchema),
})
export type GarageDashboard = z.infer<typeof dashboardSchema>

/** backend/src/garage-portal/garage-slots.service.ts (LiveSlot). */
export const SLOT_STATUSES = ['free', 'reserved', 'occupied', 'blocked'] as const
export type SlotStatus = (typeof SLOT_STATUSES)[number]

export const liveSlotSchema = z.object({
  id: z.number().int(),
  level: z.string(),
  slot_number: z.string(),
  status: z.enum(SLOT_STATUSES),
  booking: z
    .object({
      id: z.number().int(),
      /** 'walk_in': parked without the app, charged at the exit. */
      source: z.enum(BOOKING_SOURCES),
      start_time: isoDate,
      /** The booked end; null for a walk-in. */
      end_time: isoDate.nullable(),
      total_cost: z.number(),
      payment_method: z.string(),
      price_per_hour: z.number(),
      customer: z.object({ id: z.number().int(), name: z.string() }).nullable(),
      vehicle: z
        .object({ brand: z.string(), model: z.string(), license_plate: z.string() })
        .nullable(),
      plate: z.string().nullable(),
      /** A walk-in: what it would pay if it left now. */
      charge_now: z.object({ hours: z.number().int(), amount: z.number() }).nullable(),
    })
    .nullable(),
})
export type LiveSlot = z.infer<typeof liveSlotSchema>

export const liveSlotsSchema = z.object({
  garage: ownedGarageSchema,
  /** Top floor first. */
  levels: z.array(z.string()),
  slots: z.array(liveSlotSchema),
})
export type LiveSlots = z.infer<typeof liveSlotsSchema>

export const slotChangeSchema = z.object({ message: z.string(), slot: liveSlotSchema })

/** How a walk-in pays when it leaves. */
export const WALK_IN_PAYMENT_METHODS = ['cash', 'card'] as const
export type WalkInPaymentMethod = (typeof WALK_IN_PAYMENT_METHODS)[number]

export type SlotAction = 'block' | 'release'
