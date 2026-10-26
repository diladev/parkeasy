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
