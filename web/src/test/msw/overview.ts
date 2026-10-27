import { http, HttpResponse } from 'msw'

/** A copy of GET /admin/overview (backend/src/admin-overview/*) with demo figures. */
export function overviewBody(now = new Date()) {
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()
  return {
    users: { total: 1082, new_this_month: 82 },
    garages: { total: 8, pending: 2 },
    bookings_today: { today: 9, yesterday: 12 },
    revenue_month: { to_date: 64_000, previous_to_date: 50_000 },
    revenue_days: [
      { date: '2026-10-21', amount: 4500 },
      { date: '2026-10-22', amount: 0 },
      { date: '2026-10-23', amount: 12_000 },
      { date: '2026-10-24', amount: 6000 },
      { date: '2026-10-25', amount: 3000 },
      { date: '2026-10-26', amount: 9500 },
      { date: '2026-10-27', amount: 7500 },
    ],
    top_garages: [
      { id: 5, name: 'City Center Parking', city: 'Sulaymaniyah', revenue: 18_000 },
      { id: 2, name: 'Azadi Park Garage', city: 'Sulaymaniyah', revenue: 12_500 },
    ],
    recent_signups: [
      {
        id: 12,
        name: 'Zhino Ali',
        email: 'zhino@example.com',
        phone: '+964 750 221 3345',
        role: 'driver',
        status: 'active',
        created_at: hoursAgo(0),
      },
      {
        id: 11,
        name: 'Aras Taha',
        email: 'aras@example.com',
        phone: '+964 772 130 5567',
        role: 'garage_owner',
        status: 'suspended',
        created_at: hoursAgo(24),
      },
    ],
  }
}

export const overviewHandlers = [
  http.get('/api/admin/overview', () => HttpResponse.json(overviewBody())),
]
