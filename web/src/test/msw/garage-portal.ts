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
            id: 415,
            source: 'walk_in',
            status: 'active',
            ended_early: false,
            start_time: minutesAgo(10),
            end_time: null,
            total_cost: 0,
            customer: null,
            vehicle: null,
            plate: '22 SUL 909',
            slot: { level: 'G', slot_number: 'A05' },
          },
          {
            id: 412,
            source: 'app',
            status: 'active',
            ended_early: false,
            start_time: minutesAgo(40),
            end_time: minutesAgo(-20),
            total_cost: 1500,
            customer: { id: 2, name: 'Aram Kamal' },
            vehicle: { brand: 'Toyota', model: 'Corolla', license_plate: '22 A 51234' },
            plate: null,
            slot: { level: 'G', slot_number: 'A04' },
          },
          {
            id: 409,
            source: 'app',
            status: 'completed',
            ended_early: true,
            start_time: minutesAgo(300),
            end_time: minutesAgo(120),
            total_cost: 4500,
            customer: null,
            vehicle: null,
            plate: null,
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

  http.get('/api/garage/garages/:id/slots', ({ params }) => {
    const id = Number(params.id)
    const garage = OWNED_GARAGES.find((owned) => owned.id === id)
    if (!garage) return notFound()
    const slots = garagePortalDb.slots(id)
    return HttpResponse.json({
      garage,
      levels: [...new Set(slots.map((slot) => slot.level))],
      slots,
    })
  }),
  http.post('/api/garage/garages/:id/slots/:slotId/walk-in', async ({ params, request }) => {
    const slot = garagePortalDb.slots(Number(params.id)).find((s) => s.id === Number(params.slotId))
    if (!slot) return notFound('Parking slot not found.')
    if (slot.status !== 'free') return conflict("This slot isn't free any more. Pick another one.")
    const { plate } = (await request.json()) as { plate: string }
    slot.status = 'occupied'
    slot.booking = walkIn(500 + slot.id, plate, new Date())
    return HttpResponse.json({
      message: `Walk-in started on ${slot.level} · ${slot.slot_number} for ${plate}.`,
      slot,
    })
  }),
  http.post('/api/garage/garages/:id/walk-ins/:bookingId/:action', async ({ params, request }) => {
    const slot = garagePortalDb
      .slots(Number(params.id))
      .find((s) => s.booking?.id === Number(params.bookingId))
    if (!slot?.booking) return notFound('Walk-in not found.')
    const { plate, charge_now: charge } = slot.booking as {
      plate: string
      charge_now: { amount: number }
    }
    const name = `${slot.level} · ${slot.slot_number}`
    slot.status = 'free'
    slot.booking = null
    if (params.action === 'remove') {
      return HttpResponse.json({
        message: `The walk-in on ${name} was removed without a charge. The slot is free.`,
        slot,
      })
    }
    const { payment_method: method } = (await request.json()) as { payment_method: string }
    const amount = charge.amount.toLocaleString('en-US')
    return HttpResponse.json({
      message: `${plate} left ${name}: ${amount} IQD, paid by ${method}. The slot is free.`,
      slot,
    })
  }),
  http.post('/api/garage/garages/:id/slots/:slotId/:action', ({ params }) => {
    const slot = garagePortalDb.slots(Number(params.id)).find((s) => s.id === Number(params.slotId))
    if (!slot) return notFound('Parking slot not found.')
    const action = params.action as 'block' | 'release'
    const name = `${slot.level} · ${slot.slot_number}`
    // The same rules as backend/src/garage-portal/slot-actions.ts.
    if (slot.booking) {
      return conflict(
        'This slot has an active booking. It frees up by itself when the booking ends.',
      )
    }
    if (action === 'block') {
      if (slot.status === 'occupied') {
        return conflict(
          'A car is parked in this slot. Mark it as free once the car has left, then take it out of service.',
        )
      }
      slot.status = 'blocked'
      return HttpResponse.json({
        message: `Slot ${name} is out of service. Drivers can't book it until you put it back.`,
        slot,
      })
    }
    slot.status = 'free'
    return HttpResponse.json({ message: `Slot ${name} is free. Drivers can book it again.`, slot })
  }),
]

function notFound(message = 'Parking lot not found.') {
  return HttpResponse.json({ statusCode: 404, message }, { status: 404 })
}
function conflict(message: string) {
  return HttpResponse.json({ statusCode: 409, message }, { status: 409 })
}

type MockSlot = {
  id: number
  level: string
  slot_number: string
  status: 'free' | 'reserved' | 'occupied' | 'blocked'
  booking: Record<string, unknown> | null
}

/**
 * City Center (5): F1 and G, with a booking, a walk-in car and a blocked slot.
 * Bakhtiari (3): one small level.
 */
function seedSlots(garageId: number): MockSlot[] {
  const free = (id: number, level: string, n: string): MockSlot => ({
    id,
    level,
    slot_number: n,
    status: 'free',
    booking: null,
  })
  if (garageId === 3) return [free(31, 'G', 'A01'), free(32, 'G', 'A02')]
  return [
    free(51, 'F1', 'A01'),
    { ...free(52, 'F1', 'A02'), status: 'blocked' },
    free(53, 'G', 'A01'),
    {
      ...free(54, 'G', 'A02'),
      status: 'reserved',
      booking: {
        id: 412,
        source: 'app',
        start_time: '2026-10-27T09:15:00.000Z',
        end_time: '2026-10-27T11:15:00.000Z',
        total_cost: 3000,
        payment_method: 'wallet',
        price_per_hour: 1500,
        customer: { id: 2, name: 'Aram Kamal' },
        vehicle: { brand: 'Toyota', model: 'Camry', license_plate: '22 SUL 48213' },
        plate: null,
        charge_now: null,
      },
    },
    // A car with no record (from before walk-ins existed).
    { ...free(55, 'G', 'A03'), status: 'occupied' },
    free(56, 'G', 'A04'),
    // A walk-in parked 70 minutes ago: 2 started hours so far.
    {
      ...free(57, 'G', 'A05'),
      status: 'occupied',
      booking: walkIn(420, '22 SUL 4471', new Date(Date.now() - 70 * 60_000), {
        hours: 2,
        amount: 3000,
      }),
    },
  ]
}

function walkIn(id: number, plate: string, start: Date, charge = { hours: 1, amount: 1500 }) {
  return {
    id,
    source: 'walk_in',
    start_time: start.toISOString(),
    end_time: null,
    total_cost: 0,
    payment_method: 'cash',
    price_per_hour: 1500,
    customer: null,
    vehicle: null,
    plate,
    charge_now: charge,
  }
}

/** In-memory slots, so block and release show up on the next fetch; reset after each test. */
export const garagePortalDb = (() => {
  let store = new Map<number, MockSlot[]>()
  return {
    slots(garageId: number): MockSlot[] {
      if (!store.has(garageId)) store.set(garageId, seedSlots(garageId))
      return store.get(garageId)!
    },
    reset() {
      store = new Map()
    },
  }
})()
