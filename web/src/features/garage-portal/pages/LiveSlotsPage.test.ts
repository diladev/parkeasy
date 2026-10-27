import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
    expect(tiles()).toEqual(['A01 Free', 'A02 Reserved', 'A03 Occupied', 'A04 Free'])

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
    expect(links).toEqual(['Dashboard', 'Live Slots'])
  })

  it('reads in Kurdish, right to left', async () => {
    await openSlots('/garage/slots?level=G&slot=54', 'ckb')
    expect(document.documentElement.dir).toBe('rtl')
    expect(clean(document.querySelector('h1')?.textContent)).toBe('شوێنەکان بە ڕاستەوخۆ')
    expect(tiles()).toContain('A02 حیجزکراو')
    expect(details()).toContain('3,000 د.ع · جزدان')
  })
})
