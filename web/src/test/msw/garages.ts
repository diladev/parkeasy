import { http, HttpResponse } from 'msw'

import type { GarageRow, GarageStatus } from '@/features/garages'

/**
 * A small in-memory copy of GET /admin/garages and the status actions
 * (backend/src/parking/admin-garages.*), so page tests run against realistic answers.
 */
const SEED: GarageRow[] = [
  garage(1, 'Ankawa Mall Parking', 'Erbil', 'pending', 'Hana Rauf', 0, 0),
  garage(2, 'Azadi Park Garage', 'Sulaymaniyah', 'approved', 'Rawand Hama', 4.2, 18_000),
  garage(3, 'Bakhtiari Plaza Parking', 'Sulaymaniyah', 'approved', 'Sardar Ghafur', 4.8, 6_000),
  garage(4, 'Citadel Parking', 'Erbil', 'approved', 'Rawand Hama', 4.4, 0),
  garage(5, 'City Center Parking', 'Sulaymaniyah', 'approved', 'Sardar Ghafur', 4.6, 7_500),
  garage(6, 'Old Bazaar Parking', 'Sulaymaniyah', 'approved', 'Shwan Taha', 3.5, 3_750),
  garage(7, 'Sarchinar Night Parking', 'Sulaymaniyah', 'suspended', 'Shwan Taha', 3.9, 0),
  garage(8, 'Zagros Park Deck', 'Sulaymaniyah', 'pending', null, 0, 0),
]

function garage(
  id: number,
  name: string,
  city: string,
  status: GarageStatus,
  owner: string | null,
  rating: number,
  revenue: number,
): GarageRow {
  return {
    id,
    name,
    city,
    address: `${name} Street, ${city}`,
    status,
    rating,
    total_slots: 10 + id,
    revenue_30d: revenue,
    owner: owner ? { id: 100 + id, name: owner, email: `owner${id}@example.com` } : null,
  }
}

/** The detail answer for a list row; City Center (id 5) has bookings and a revenue history. */
function detailOf(row: GarageRow) {
  const hasHistory = row.id === 5
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    status: row.status,
    rating: row.rating,
    latitude: 35.5571,
    longitude: 45.4356,
    price_per_hour: 1500,
    is_open_24h: row.id === 5,
    opening_time: '08:00',
    closing_time: '22:00',
    free_cancellation_minutes: 30,
    amenities: { cctv: true, ev_charging: false, covered: true, accessible: row.id === 5 },
    owner: row.owner,
    created_at: '2026-01-15T09:00:00.000Z',
    slots: hasHistory
      ? {
          total: 28,
          taken: 5,
          levels: [
            { level: 'G', total: 8, taken: 7 },
            { level: 'B1', total: 12, taken: 1 },
            { level: 'B2', total: 8, taken: 5 },
          ],
        }
      : { total: 0, taken: 0, levels: [] },
    revenue: { last_30_days: row.revenue_30d, previous_30_days: hasHistory ? 3000 : 0 },
    recent_bookings: hasHistory
      ? [
          {
            id: 10,
            status: 'active',
            ended_early: false,
            start_time: '2026-10-26T09:43:00.000Z',
            end_time: '2026-10-26T12:43:00.000Z',
            total_cost: 4500,
            customer: { id: 8, name: 'Lana Rashid' },
            vehicle: { brand: 'Toyota', model: 'Hilux', license_plate: '22 SUL 61902' },
            slot: { level: 'B2', slot_number: 'A01' },
          },
          {
            id: 4,
            status: 'completed',
            ended_early: true,
            start_time: '2026-10-25T07:00:00.000Z',
            end_time: '2026-10-25T10:00:00.000Z',
            total_cost: 3000,
            customer: null,
            vehicle: null,
            slot: { level: 'G', slot_number: 'A05' },
          },
        ]
      : [],
  }
}

export const garagesDb = {
  rows: structuredClone(SEED),
  /** Every list request, to check what the page asked for. */
  requests: [] as URLSearchParams[],
  reset() {
    this.rows = structuredClone(SEED)
    this.requests = []
  },
}

const TRANSITIONS: Record<string, [GarageStatus, GarageStatus]> = {
  approve: ['pending', 'approved'],
  suspend: ['approved', 'suspended'],
  restore: ['suspended', 'approved'],
}

const MESSAGES: Record<string, string> = {
  approve: 'Garage approved. Drivers can find it in the app now.',
  suspend: "Garage suspended. It's hidden from the app; bookings already made continue.",
  restore: 'Garage restored. Drivers can find it in the app again.',
}

export const garageHandlers = [
  http.get('/api/admin/garages', ({ request }) => {
    const url = new URL(request.url)
    garagesDb.requests.push(url.searchParams)
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    const matching = garagesDb.rows.filter(
      (row) =>
        !q ||
        [row.name, row.city, row.address, row.owner?.name ?? ''].some((text) =>
          text.toLowerCase().includes(q),
        ),
    )
    const filtered = status ? matching.filter((row) => row.status === status) : matching
    const counts = { all: matching.length, pending: 0, approved: 0, suspended: 0 }
    for (const row of matching) counts[row.status]++

    return HttpResponse.json({
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      meta: {
        totalItems: filtered.length,
        itemsPerPage: pageSize,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        currentPage: page,
      },
      links: {},
      counts,
    })
  }),

  http.get('/api/admin/garages/:id', ({ params }) => {
    const row = garagesDb.rows.find((item) => item.id === Number(params.id))
    if (!row) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Parking lot not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(detailOf(row))
  }),

  http.post('/api/admin/garages/:id/:action', ({ params }) => {
    const row = garagesDb.rows.find((item) => item.id === Number(params.id))
    const action = String(params.action)
    const transition = TRANSITIONS[action]
    if (!row)
      return HttpResponse.json(
        { statusCode: 404, message: 'Parking lot not found.' },
        { status: 404 },
      )
    if (!transition || row.status !== transition[0]) {
      return HttpResponse.json(
        {
          statusCode: 409,
          message:
            "This garage's status has changed since you loaded the page. Refresh and try again.",
        },
        { status: 409 },
      )
    }
    row.status = transition[1]
    return HttpResponse.json({ id: row.id, status: row.status, message: MESSAGES[action] })
  }),
]
