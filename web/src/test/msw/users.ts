import { http, HttpResponse } from 'msw'

import type { Role, UserStatus } from '@/features/users'

/**
 * A small in-memory copy of /admin/users (backend/src/admin-users/*), so page
 * tests run against realistic answers.
 */
interface MockUser {
  id: number
  name: string
  email: string
  phone: string
  role: Role
  status: UserStatus
  bookings: number
  wallet_balance: number
  created_at: string
}

const SEED: MockUser[] = [
  user(1, 'Aram Hassan', 'aram@example.com', '+964 750 100 0001', 'driver', 'active', 6, 23_000),
  user(2, 'Shilan Ahmed', 'shilan@example.com', '+964 770 100 0002', 'driver', 'active', 3, 1_250),
  user(3, 'Lana Rashid', 'lana@example.com', '+964 751 100 0003', 'driver', 'active', 1, 50_000),
  user(4, 'Karwan Omer', 'karwan@example.com', '+964 750 100 0004', 'driver', 'active', 0, 0),
  user(5, 'Hemin Aziz', 'hemin@example.com', '+964 772 100 0005', 'driver', 'suspended', 0, 0),
  user(
    6,
    'Sardar Ghafur',
    'sardar@example.com',
    '+964 750 200 0001',
    'garage_owner',
    'active',
    0,
    0,
  ),
  user(7, 'Dilan K.', 'admin@parkeasy.app', '+964 750 100 0099', 'admin', 'active', 0, 0),
]

function user(
  id: number,
  name: string,
  email: string,
  phone: string,
  role: Role,
  status: UserStatus,
  bookings: number,
  wallet: number,
): MockUser {
  return {
    id,
    name,
    email,
    phone,
    role,
    status,
    bookings,
    wallet_balance: wallet,
    // Newest first in the list: a higher id joined later.
    created_at: new Date(Date.UTC(2026, 0, id, 9)).toISOString(),
  }
}

/** Aram (1) has the full history; Sardar (6) runs two garages. */
function detailOf(row: MockUser) {
  const isAram = row.id === 1
  return {
    ...row,
    stats: {
      bookings: row.bookings,
      bookings_this_week: isAram ? 4 : 0,
      cancelled: isAram ? 1 : 0,
      spent: isAram ? 15_000 : 0,
      wallet_balance: row.wallet_balance,
      last_top_up: isAram ? { amount: 15_000, at: '2026-10-16T15:05:00.000Z' } : null,
    },
    vehicles: isAram
      ? [
          {
            id: 1,
            brand: 'Toyota',
            model: 'Corolla',
            year: 2019,
            color: 'White',
            license_plate: '22 SUL 48213',
            is_default: true,
          },
          {
            id: 2,
            brand: 'Kia',
            model: 'Sportage',
            year: 2021,
            color: 'Grey',
            license_plate: '22 SUL 77120',
            is_default: false,
          },
        ]
      : [],
    wallet_activity: isAram
      ? [
          {
            id: 9,
            type: 'debit',
            category: 'BOOKING_PAYMENT',
            amount: 3000,
            at: '2026-10-26T11:20:00.000Z',
            garage: 'City Center Parking',
          },
          {
            id: 4,
            type: 'credit',
            category: 'BOOKING_REFUND',
            amount: 4500,
            at: '2026-10-21T16:06:00.000Z',
            garage: 'City Center Parking',
          },
          {
            id: 2,
            type: 'credit',
            category: 'TOP_UP',
            amount: 15_000,
            at: '2026-10-16T15:05:00.000Z',
            garage: null,
          },
        ]
      : [],
    recent_bookings: isAram
      ? [
          {
            id: 12,
            status: 'active',
            ended_early: false,
            start_time: '2026-10-26T11:20:00.000Z',
            duration_hours: 2,
            total_cost: 3000,
            garage: { id: 5, name: 'City Center Parking' },
            slot: { level: 'B1', slot_number: 'A03' },
          },
          {
            id: 7,
            status: 'cancelled',
            ended_early: false,
            start_time: '2026-10-21T16:00:00.000Z',
            duration_hours: 3,
            total_cost: 4500,
            garage: { id: 5, name: 'City Center Parking' },
            slot: { level: 'B1', slot_number: 'A07' },
          },
        ]
      : [],
    garages:
      row.id === 6
        ? [
            { id: 3, name: 'Bakhtiari Plaza Parking', city: 'Sulaymaniyah', status: 'approved' },
            { id: 5, name: 'City Center Parking', city: 'Sulaymaniyah', status: 'approved' },
          ]
        : [],
  }
}

export const usersDb = {
  rows: structuredClone(SEED),
  /** Every list or export request, to check what the page asked for. */
  requests: [] as { path: string; params: URLSearchParams }[],
  /** Ids that were sent a password reset. */
  resets: [] as number[],
  reset() {
    this.rows = structuredClone(SEED)
    this.requests = []
    this.resets = []
  },
}

function matching(url: URL): MockUser[] {
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  return usersDb.rows
    .filter(
      (row) =>
        !q ||
        [row.name, row.email, row.phone.replace(/\s/g, '')].some((text) =>
          text.toLowerCase().includes(q.replace(/\s/g, '')),
        ),
    )
    .sort((a, b) => b.id - a.id)
}

const notFound = () =>
  HttpResponse.json({ statusCode: 404, message: 'User not found.' }, { status: 404 })
const conflict = (message: string) =>
  HttpResponse.json({ statusCode: 409, message }, { status: 409 })

const TRANSITIONS: Record<string, [UserStatus, UserStatus, string]> = {
  suspend: [
    'active',
    'suspended',
    "Account suspended. They're signed out and can't sign in until you restore it.",
  ],
  restore: ['suspended', 'active', 'Account restored. They can sign in again.'],
}

export const userHandlers = [
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url)
    usersDb.requests.push({ path: url.pathname, params: url.searchParams })
    const role = url.searchParams.get('role')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    const found = matching(url)
    const filtered = role ? found.filter((row) => row.role === role) : found
    const counts = { all: found.length, driver: 0, garage_owner: 0, admin: 0 }
    for (const row of found) counts[row.role]++

    return HttpResponse.json({
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      meta: {
        totalItems: filtered.length,
        itemsPerPage: pageSize,
        // Like the backend: 0 pages when nothing matched.
        totalPages: Math.ceil(filtered.length / pageSize),
        currentPage: page,
      },
      links: {},
      counts,
    })
  }),

  http.get('/api/admin/users/export', ({ request }) => {
    const url = new URL(request.url)
    usersDb.requests.push({ path: url.pathname, params: url.searchParams })
    const role = url.searchParams.get('role')
    const rows = matching(url).filter((row) => !role || row.role === role)
    const csv = ['ID,Name,Email', ...rows.map((row) => `${row.id},${row.name},${row.email}`)]
    return new HttpResponse(`﻿${csv.join('\r\n')}\r\n`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="parkeasy-users-2026-10-26.csv"',
      },
    })
  }),

  http.get('/api/admin/users/:id', ({ params }) => {
    const row = usersDb.rows.find((item) => item.id === Number(params.id))
    return row ? HttpResponse.json(detailOf(row)) : notFound()
  }),

  http.post('/api/admin/users/:id/password-reset', ({ params }) => {
    const row = usersDb.rows.find((item) => item.id === Number(params.id))
    if (!row) return notFound()
    if (row.status !== 'active') {
      return conflict('Restore the account before sending a password reset.')
    }
    usersDb.resets.push(row.id)
    return HttpResponse.json({
      message: `A password reset code was emailed to ${row.email}. It works for 10 minutes.`,
    })
  }),

  http.post('/api/admin/users/:id/:action', ({ params }) => {
    const row = usersDb.rows.find((item) => item.id === Number(params.id))
    if (!row) return notFound()
    const transition = TRANSITIONS[String(params.action)]
    if (row.role === 'admin') {
      return conflict("Admin accounts can't be suspended from the Admin Panel.")
    }
    if (!transition || row.status !== transition[0]) {
      return conflict(
        "This account's status has changed since you loaded the page. Refresh and try again.",
      )
    }
    row.status = transition[1]
    return HttpResponse.json({ id: row.id, status: row.status, message: transition[2] })
  }),
]
