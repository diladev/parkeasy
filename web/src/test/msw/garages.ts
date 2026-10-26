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
