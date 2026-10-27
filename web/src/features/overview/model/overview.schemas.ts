import { z } from 'zod'

/*
 * Matches AdminOverview in backend/src/admin-overview/admin-overview.service.ts.
 * Parsed at runtime, so a backend change fails loudly here. Amounts are whole dinars.
 */

const isoDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value))

export const overviewSchema = z.object({
  users: z.object({ total: z.number().int(), new_this_month: z.number().int() }),
  garages: z.object({ total: z.number().int(), pending: z.number().int() }),
  bookings_today: z.object({ today: z.number().int(), yesterday: z.number().int() }),
  revenue_month: z.object({ to_date: z.number(), previous_to_date: z.number() }),
  /** Seven Iraq calendar days ("2026-10-27"), oldest first. */
  revenue_days: z.array(z.object({ date: z.iso.date(), amount: z.number() })),
  top_garages: z.array(
    z.object({ id: z.number().int(), name: z.string(), city: z.string(), revenue: z.number() }),
  ),
  recent_signups: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      email: z.string(),
      phone: z.string(),
      role: z.enum(['driver', 'garage_owner', 'admin']),
      status: z.enum(['active', 'suspended', 'inactive']),
      created_at: isoDate,
    }),
  ),
})
export type Overview = z.infer<typeof overviewSchema>
export type RevenueDay = Overview['revenue_days'][number]
export type TopGarage = Overview['top_garages'][number]
export type Signup = Overview['recent_signups'][number]
