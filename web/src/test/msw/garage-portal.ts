import { http, HttpResponse } from 'msw'

/** A garage owner with two garages, as in the backend seed (Sardar). */
export const OWNER = {
  email: 'sardar@example.com',
  password: 'Demo@1234',
  me: {
    user: { id: 103, name: 'Sardar Ghafur', email: 'sardar@example.com' },
    role: 'garage_owner',
    permissions: ['garage.access'],
  },
}

export const OWNED_GARAGES = [
  { id: 3, name: 'Bakhtiari Plaza Parking', city: 'Sulaymaniyah', status: 'approved' },
  { id: 5, name: 'City Center Parking', city: 'Sulaymaniyah', status: 'approved' },
]

/** A copy of GET /garage/garages/:id/dashboard (backend/src/garage-portal/*). */
export function dashboardBody(id: number, now = new Date()) {
  const garage = OWNED_GARAGES.find((owned) => owned.id === id) ?? OWNED_GARAGES[0]
  const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString()
  const busy = id === 5
  return {
    garage,
    occupancy: busy ? { taken: 18, total: 25 } : { taken: 2, total: 10 },
    revenue_today: busy ? { today: 7500, yesterday: 6000 } : { today: 0, yesterday: 0 },
    active_bookings: busy ? { active: 4, ending_soon: 3 } : { active: 0, ending_soon: 0 },
    average_stay: busy
      ? { last_7_days: 135, previous_7_days: 150 }
      : { last_7_days: null, previous_7_days: null },
    revenue_days: [
      { date: '2026-10-21', amount: busy ? 4500 : 0 },
      { date: '2026-10-22', amount: 0 },
      { date: '2026-10-23', amount: busy ? 12_000 : 1500 },
      { date: '2026-10-24', amount: busy ? 6000 : 0 },
      { date: '2026-10-25', amount: busy ? 3000 : 0 },
      { date: '2026-10-26', amount: busy ? 6000 : 0 },
      { date: '2026-10-27', amount: busy ? 7500 : 0 },
    ],
    levels: busy
      ? [
          { level: 'B1', total: 10, taken: 9 },
          { level: 'G', total: 15, taken: 9 },
        ]
      : [{ level: 'G', total: 10, taken: 2 }],
    recent_bookings: busy
      ? [
          {
            id: 412,
            status: 'active',
            ended_early: false,
            start_time: minutesAgo(40),
            end_time: minutesAgo(-20),
            total_cost: 1500,
            customer: { id: 2, name: 'Aram Kamal' },
            vehicle: { brand: 'Toyota', model: 'Corolla', license_plate: '22 A 51234' },
            slot: { level: 'G', slot_number: 'A04' },
          },
          {
            id: 409,
            status: 'completed',
            ended_early: true,
            start_time: minutesAgo(300),
            end_time: minutesAgo(120),
            total_cost: 4500,
            customer: null,
            vehicle: null,
            slot: { level: 'B1', slot_number: 'A01' },
          },
        ]
      : [],
  }
}

export const garagePortalHandlers = [
  http.get('/api/garage/garages', () => HttpResponse.json(OWNED_GARAGES)),
  http.get('/api/garage/garages/:id/dashboard', ({ params }) => {
    const id = Number(params.id)
    if (!OWNED_GARAGES.some((garage) => garage.id === id)) {
      return HttpResponse.json(
        { statusCode: 404, message: 'Parking lot not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(dashboardBody(id))
  }),
]
