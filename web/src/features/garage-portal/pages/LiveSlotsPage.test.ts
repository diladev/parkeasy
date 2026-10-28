import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { garagePortalDb } from '@/test/msw/garage-portal'
import { OWNER, nestError } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  localStorage.clear()
})

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()
function words(root: Node | null): string {
  if (!root) return ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '')
  return clean(parts.join(' '))
}

const tiles = () =>
  [...document.querySelectorAll<HTMLButtonElement>('[data-slot-id]')].map((b) => words(b))
const tile = (number: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[data-slot-id]')].find((b) =>
    words(b).startsWith(number),
  )!
const details = () => words(document.querySelector('[data-slot-details]'))
const tab = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="tab"]')].find((t) =>
    clean(t.textContent).startsWith(label),
  )!
const button = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => clean(b.textContent) === label,
  )!

/** City Center (id 5) has the interesting slots. */
async function openSlots(path = '/garage/slots', locale: 'en' | 'ckb' = 'en') {
  localStorage.setItem('parkeasy.garage-portal.garage', '5')
  const app = await mountApp(path, { signedInAs: OWNER.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() =>
    expect(document.querySelectorAll('[data-slot-id]').length).toBeGreaterThan(0),
  )
  await flushPromises()
  return app
}

async function pressTab(label: string) {
  tab(label).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
  await flushPromises()
}

async function choose(number: string) {
  tile(number).click()
  await flushPromises()
}

describe('LiveSlotsPage', () => {
  it('opens on the top level, with free counts on the tabs and a legend', async () => {
    await openSlots()

    expect(clean(document.querySelector('h1')?.textContent)).toBe('Live Slots')
    const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => clean(t.textContent))
    expect(tabs).toEqual(['Floor 1 · 1 free', 'Ground floor · 2 free'])
    expect(tiles()).toEqual(['A01 Free', 'A02 Blocked'])
    expect(words(document.querySelector('[aria-label="Slots on this level"]'))).toBe(
      'Free 1 Reserved 0 Occupied 0 Blocked 1',
    )
    expect(details()).toBe('Slot details Select a slot to see who is in it and what you can do.')
  })

  it('shows who holds a booked slot, and offers nothing to change', async () => {
    const app = await openSlots()
    await pressTab('Ground floor')
    expect(tiles()).toEqual([
      'A01 Free',
      'A02 Reserved',
      'A03 Occupied',
      'A04 Free',
      'A05 Occupied',
    ])

    await choose('A02')
    expect(app.router.currentRoute.value.query).toEqual({ level: 'G', slot: '54' })
    expect(tile('A02').getAttribute('aria-pressed')).toBe('true')
    // Selecting a slot keeps focus on it instead of jumping to the heading.
    expect(document.activeElement).not.toBe(document.querySelector('h1'))

    const text = details()
    expect(text).toContain('Slot A02 Ground floor (G) Reserved')
    expect(text).toContain('Customer Aram Kamal')
    expect(text).toContain('Vehicle Toyota Camry · 22 SUL 48213')
    expect(text).toContain('Ends 14:15')
    expect(text).toContain('Amount 3,000 IQD · Wallet')
    expect(text).toContain('It frees up by itself when the booking ends.')
    expect(document.querySelector('[data-slot-details] button')).toBeNull()
  })

  it('blocks a free slot for maintenance and puts it back', async () => {
    await openSlots('/garage/slots?level=G&slot=53')
    expect(details()).toContain('Slot A01')

    button('Block for maintenance').click()
    await vi.waitFor(() => expect(words(tile('A01'))).toBe('A01 Blocked'))
    expect(clean(document.body.textContent)).toContain(
      "Slot G · A01 is out of service. Drivers can't book it until you put it back.",
    )
    expect(clean(document.querySelector('[role="tab"][aria-selected="true"]')?.textContent)).toBe(
      'Ground floor · 1 free',
    )

    button('Put back in service').click()
    await vi.waitFor(() => expect(words(tile('A01'))).toBe('A01 Free'))
  })

  it('marks a slot free after a car without a booking has left', async () => {
    await openSlots('/garage/slots?level=G')
    await choose('A03')
    expect(details()).toContain('A car is parked here without a booking.')

    button('Mark as free').click()
    await vi.waitFor(() => expect(words(tile('A03'))).toBe('A03 Free'))
  })

  it("shows the server's reason when it refuses", async () => {
    server.use(
      mock.post('/api/garage/garages/:id/slots/:slotId/block', () =>
        nestError(
          409,
          'This slot has an active booking. It frees up by itself when the booking ends.',
        ),
      ),
    )
    await openSlots('/garage/slots?level=G&slot=56')
    button('Block for maintenance').click()

    await vi.waitFor(() =>
      expect(clean(document.body.textContent)).toContain(
        'This slot has an active booking. It frees up by itself when the booking ends.',
      ),
    )
    expect(words(tile('A04'))).toBe('A04 Free')
  })

  it('forgets the selected slot when another level is shown', async () => {
    const app = await openSlots('/garage/slots?level=G&slot=54')
    await pressTab('Floor 1')
    expect(app.router.currentRoute.value.query).toEqual({ level: 'F1' })
    expect(details()).toBe('Slot details Select a slot to see who is in it and what you can do.')
  })

  it('explains a garage without slots', async () => {
    server.use(
      mock.get('/api/garage/garages/:id/slots', () =>
        HttpResponse.json({
          garage: { id: 5, name: 'City Center Parking', city: 'Sulaymaniyah', status: 'approved' },
          levels: [],
          slots: [],
        }),
      ),
    )
    localStorage.setItem('parkeasy.garage-portal.garage', '5')
    const app = await mountApp('/garage/slots', { signedInAs: OWNER.me })
    wrapper = app.wrapper
    await vi.waitFor(() =>
      expect(clean(document.querySelector('main')?.textContent)).toContain(
        'This garage has no slots yet.',
      ),
    )
  })

  it('is in the sidebar after the dashboard', async () => {
    await openSlots()
    const links = [...document.querySelectorAll('[id^="dashboard-sidebar"] a')].map((a) =>
      clean(a.textContent),
    )
    expect(links).toEqual(['Dashboard', 'Live Slots', 'Bookings', 'Settings'])
  })

  it('reads in Kurdish, right to left', async () => {
    await openSlots('/garage/slots?level=G&slot=54', 'ckb')
    expect(document.documentElement.dir).toBe('rtl')
    expect(clean(document.querySelector('h1')?.textContent)).toBe('شوێنەکان بە ڕاستەوخۆ')
    expect(tiles()).toContain('A02 حیجزکراو')
    expect(details()).toContain('3,000 د.ع · جزدان')
  })
})

describe('LiveSlotsPage · walk-ins', () => {
  const input = (label: string) => {
    const labelEl = [...document.querySelectorAll('label')].find(
      (l) => clean(l.textContent) === label,
    )
    const found = labelEl && document.getElementById(labelEl.htmlFor)
    if (!(found instanceof HTMLInputElement)) throw new Error(`No input labelled "${label}"`)
    return found
  }
  async function type(label: string, value: string) {
    const field = input(label)
    field.value = value
    field.dispatchEvent(new Event('input'))
    await flushPromises()
  }
  const dialog = () => document.querySelector('[role="dialog"]')

  it('records a car that parked without the app', async () => {
    let sent: unknown
    server.use(
      mock.post('/api/garage/garages/:id/slots/:slotId/walk-in', async ({ request }) => {
        sent = await request.clone().json()
        return undefined
      }),
    )
    await openSlots('/garage/slots?level=G&slot=53')
    expect(details()).toContain('or record a car that parked here without it')

    button('Car parked here').click()
    await flushPromises()
    // Focus goes straight to the plate field.
    expect(document.activeElement).toBe(input('License plate'))

    await type('License plate', '!')
    document.querySelector('[data-slot-details] form')?.dispatchEvent(new Event('submit'))
    await flushPromises()
    expect(details()).toContain('Use letters, numbers, spaces and dashes (2–15 characters).')
    expect(sent).toBeUndefined()

    await type('License plate', '  22  sul 777 ')
    document.querySelector('[data-slot-details] form')?.dispatchEvent(new Event('submit'))
    await vi.waitFor(() => expect(words(tile('A01'))).toBe('A01 Occupied'))
    expect(sent).toEqual({ plate: '22 SUL 777' })
    expect(clean(document.body.textContent)).toContain('Walk-in started on G · A01 for 22 SUL 777.')
    expect(details()).toContain('Plate 22 SUL 777')
  })

  it('breaks the fee down by day when it crossed midnight, hit the cap or a special price', async () => {
    const walkIn = garagePortalDb.slots(5).find((slot) => slot.id === 57)!.booking!
    walkIn.charge_now = {
      hours: 30,
      amount: 21000,
      days: [
        {
          date: '2026-10-27',
          hours: 10,
          price_per_hour: 1500,
          daily_cap: 9000,
          label: null,
          amount: 9000,
          capped: true,
        },
        {
          date: '2026-10-28',
          hours: 20,
          price_per_hour: 2000,
          daily_cap: 12000,
          label: 'Weekend market',
          amount: 12000,
          capped: true,
        },
      ],
    }
    await openSlots('/garage/slots?level=G&slot=57')
    expect(details()).toContain(
      'Fee so far 21,000 IQD 27 Oct 2026: 10 h, daily cap 9,000 IQD 28 Oct 2026: 20 h, daily cap 12,000 IQD (Weekend market)',
    )
  })

  it('shows the plate and the fee so far, and charges it at the exit', async () => {
    let sent: unknown
    server.use(
      mock.post('/api/garage/garages/:id/walk-ins/:bookingId/end', async ({ request }) => {
        sent = await request.clone().json()
        return undefined
      }),
    )
    await openSlots('/garage/slots?level=G&slot=57')
    const text = details()
    expect(text).toContain('Plate 22 SUL 4471')
    expect(text).toContain('Fee so far 3,000 IQD 2 h × 1,500 IQD')
    expect(text).toContain('Parked without the app. It pays at the exit.')
    // A walk-in can't be "marked free": it's ended and charged instead.
    expect(document.querySelector('[data-slot-details]')?.textContent).not.toContain('Mark as free')

    button('End & charge').click()
    await flushPromises()
    expect(words(dialog())).toContain('End the stay of 22 SUL 4471?')
    expect(words(dialog())).toContain('To pay 3,000 IQD')
    const cardLabel = [...document.querySelectorAll('label')].find(
      (l) => clean(l.textContent) === 'Card',
    )!
    const card = document.getElementById(cardLabel.htmlFor)!
    card.click()
    await flushPromises()
    button('End & charge 3,000 IQD').click()

    await vi.waitFor(() => expect(words(tile('A05'))).toBe('A05 Free'))
    expect(sent).toEqual({ payment_method: 'card' })
    expect(clean(document.body.textContent)).toContain(
      '22 SUL 4471 left G · A05: 3,000 IQD, paid by card. The slot is free.',
    )
    await vi.waitFor(() => expect(dialog()).toBeNull())
  })

  it('removes a walk-in entered by mistake', async () => {
    await openSlots('/garage/slots?level=G&slot=57')
    button('Entered by mistake? Remove it').click()
    await flushPromises()
    expect(words(dialog())).toContain('Only for a car entered by mistake.')
    button('Remove').click()
    await vi.waitFor(() => expect(words(tile('A05'))).toBe('A05 Free'))
  })
})
