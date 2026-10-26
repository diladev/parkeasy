import { z } from 'zod'

import { paginated } from '@/shared/api/pagination'

/*
 * Matches backend/src/admin-users/admin-users.service.ts (AdminUserRow,
 * AdminUserDetail). Parsed at runtime, so a backend change fails loudly here.
 */

export const ROLES = ['driver', 'garage_owner', 'admin'] as const
export const roleSchema = z.enum(ROLES)
export type Role = z.infer<typeof roleSchema>

/** 'inactive' exists in the database but nothing sets it yet. */
export const USER_STATUSES = ['active', 'suspended', 'inactive'] as const
export const userStatusSchema = z.enum(USER_STATUSES)
export type UserStatus = z.infer<typeof userStatusSchema>

/** JSON dates arrive as ISO strings. */
const isoDate = z.iso.datetime({ offset: true }).transform((value) => new Date(value))

export const userRowSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: roleSchema,
  status: userStatusSchema,
  bookings: z.number().int(),
  /** Whole Iraqi dinars. */
  wallet_balance: z.number(),
  created_at: isoDate,
})
export type UserRow = z.infer<typeof userRowSchema>

export const userCountsSchema = z.object({
  all: z.number().int(),
  driver: z.number().int(),
  garage_owner: z.number().int(),
  admin: z.number().int(),
})
export type UserCounts = z.infer<typeof userCountsSchema>

export const userListSchema = paginated(userRowSchema).extend({ counts: userCountsSchema })
export type UserList = z.infer<typeof userListSchema>

export const BOOKING_STATUSES = ['active', 'completed', 'cancelled'] as const
export const WALLET_CATEGORIES = [
  'TOP_UP',
  'BOOKING_PAYMENT',
  'BOOKING_EXTENSION',
  'BOOKING_REFUND',
] as const

export const userBookingSchema = z.object({
  id: z.number().int(),
  status: z.enum(BOOKING_STATUSES),
  ended_early: z.boolean(),
  start_time: isoDate,
  duration_hours: z.number(),
  total_cost: z.number(),
  garage: z.object({ id: z.number().int(), name: z.string() }).nullable(),
  slot: z.object({ level: z.string(), slot_number: z.string() }).nullable(),
})
export type UserBooking = z.infer<typeof userBookingSchema>

export const walletEntrySchema = z.object({
  id: z.number().int(),
  type: z.enum(['credit', 'debit']),
  category: z.enum(WALLET_CATEGORIES),
  amount: z.number(),
  at: isoDate,
  garage: z.string().nullable(),
})
export type WalletEntry = z.infer<typeof walletEntrySchema>

export const vehicleSchema = z.object({
  id: z.number().int(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  color: z.string(),
  license_plate: z.string(),
  is_default: z.boolean(),
})
export type Vehicle = z.infer<typeof vehicleSchema>

export const ownedGarageSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  city: z.string(),
  status: z.enum(['pending', 'approved', 'suspended']),
})
export type OwnedGarage = z.infer<typeof ownedGarageSchema>

export const userDetailSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: roleSchema,
  status: userStatusSchema,
  created_at: isoDate,
  stats: z.object({
    bookings: z.number().int(),
    bookings_this_week: z.number().int(),
    cancelled: z.number().int(),
    spent: z.number(),
    wallet_balance: z.number(),
    last_top_up: z.object({ amount: z.number(), at: isoDate }).nullable(),
  }),
  vehicles: z.array(vehicleSchema),
  wallet_activity: z.array(walletEntrySchema),
  recent_bookings: z.array(userBookingSchema),
  garages: z.array(ownedGarageSchema),
})
export type UserDetail = z.infer<typeof userDetailSchema>

export const userStatusChangeSchema = z.object({
  id: z.number().int(),
  status: userStatusSchema,
  /** Already translated by the backend. */
  message: z.string(),
})
export type UserStatusChange = z.infer<typeof userStatusChangeSchema>

export const messageSchema = z.object({ message: z.string() })
