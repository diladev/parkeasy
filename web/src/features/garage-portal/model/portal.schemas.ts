import { z } from 'zod'

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
  recent_bookings: z.array(
    z.object({
      id: z.number().int(),
      status: z.enum(['active', 'completed', 'cancelled']),
      ended_early: z.boolean(),
      start_time: isoDate,
      end_time: isoDate,
      total_cost: z.number(),
      customer: z.object({ id: z.number().int(), name: z.string() }).nullable(),
      vehicle: z
        .object({ brand: z.string(), model: z.string(), license_plate: z.string() })
        .nullable(),
      slot: z.object({ level: z.string(), slot_number: z.string() }).nullable(),
    }),
  ),
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
      start_time: isoDate,
      end_time: isoDate,
      total_cost: z.number(),
      payment_method: z.string(),
      customer: z.object({ id: z.number().int(), name: z.string() }).nullable(),
      vehicle: z
        .object({ brand: z.string(), model: z.string(), license_plate: z.string() })
        .nullable(),
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

export type SlotAction = 'block' | 'release'
