import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { nestError, OWNER } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  localStorage.clear()
})

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()
/** Text with a space between elements, as it reads on screen. */
function words(root: Node | null): string {
  if (!root) return ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '')
  return clean(parts.join(' '))
}
const mainText = () => words(document.querySelector('main'))
/** Booking numbers in the table, top to bottom. */
const ids = () =>
  [...document.querySelectorAll('main tbody tr td:first-child')]
    .map((td) => clean(td.textContent))
    .filter((id) => id.startsWith('#'))
const row = (id: number) =>
  words(
    [...document.querySelectorAll('main tbody tr')].find((tr) =>
      clean(tr.textContent).startsWith(`#${id}`),
    ) ?? null,
  )
function button(label: string): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((b) => clean(b.textContent) === label)
  if (!match) throw new Error(`No button "${label}"`)
  return match
}
const searchBox = () => document.querySelector<HTMLInputElement>('main input[type="search"]')!

/** City Center (id 5) has the booking history; it's remembered as the open garage. */
async function openBookings(path = '/garage/bookings', locale: 'en' | 'ckb' = 'en') {
  localStorage.setItem('parkeasy.garage-portal.garage', '5')
  const app = await mountApp(path, { signedInAs: OWNER.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() =>
    expect(document.querySelector('main tbody tr td:first-child')).not.toBeNull(),
  )
  await flushPromises()
  return app
}

/** Opens a select by its label and picks an option, with the keyboard (jsdom has no pointer capture). */
async function pick(label: string, option: string) {
  const select = document.querySelector<HTMLButtonElement>(`main [aria-label="${label}"]`)!
  select.focus()
  select.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await flushPromises()
  const item = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (o) => clean(o.textContent) === option,
  )
  if (!item) throw new Error(`No option "${option}"`)
  item.focus()
  item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await flushPromises()
}

describe('GarageBookingsPage', () => {
  it('lists the newest bookings first, ten to a page, app bookings and walk-ins alike', async () => {
    await openBookings()

    expect(clean(document.querySelector('h1')?.textContent)).toBe('Bookings')
    expect(document.title).toBe('Bookings · ParkEasy')
    expect(ids()).toEqual([
      '#500',
      '#499',
      '#498',
      '#497',
      '#496',
      '#495',
      '#494',
      '#493',
      '#492',
      '#491',
    ])
    // An app booking: who, which car, how long, what it cost.
    expect(row(500)).toContain('Aram Kamal Toyota Corolla · 22 SUL 1000 G · A01')
    expect(row(500)).toContain('2h 3,000 IQD Active')
    // A walk-in still parked: its plate, no duration yet, pays at the exit.
    expect(row(499)).toContain('Walk-in 21 ERB 2001 G · A02')
    expect(row(499)).toContain('— Pays at exit Active')
    expect(row(496)).toContain('Cancelled')
    expect(mainText()).toContain('Showing 1–10 of 23 bookings')
    expect(mainText()).toContain('Duration')
  })

  it('is in the sidebar, and the dashboard links to it', async () => {
    const app = await openBookings('/garage')
    const links = [...document.querySelectorAll('nav a')].map((a) => clean(a.textContent))
    expect(links).toContain('Bookings')

    const viewAll = [...document.querySelectorAll<HTMLAnchorElement>('main a')].find(
      (a) => clean(a.textContent) === 'View all',
    )
    expect(viewAll?.getAttribute('href')).toBe('/garage/bookings')
    viewAll!.click()
    await vi.waitFor(() => expect(app.router.currentRoute.value.name).toBe('garage.bookings'))
  })

  it('pages through the URL', async () => {
    const app = await openBookings()

    const next = document.querySelector<HTMLAnchorElement>('main a[href="/garage/bookings?page=3"]')
    expect(next).not.toBeNull()
    next!.click()
    await vi.waitFor(() => expect(ids()).toEqual(['#480', '#479', '#478']))
    expect(app.router.currentRoute.value.fullPath).toBe('/garage/bookings?page=3')
    expect(mainText()).toContain('Showing 21–23 of 23 bookings')
  })

  it('filters by status, source and period, starting again from page 1', async () => {
    const app = await openBookings('/garage/bookings?page=2')

    button('Cancelled').click()
    await vi.waitFor(() => expect(ids()).toEqual(['#496', '#491', '#486', '#481']))
    expect(app.router.currentRoute.value.query).toEqual({ status: 'cancelled' })

    await pick('Booked through', 'Walk-ins')
    await vi.waitFor(() => expect(ids()).toEqual(['#496', '#481']))
    expect(app.router.currentRoute.value.query).toEqual({ status: 'cancelled', source: 'walk_in' })

    button('All').click()
    await pick('Started', 'Today')
    await vi.waitFor(() => expect(ids()).toEqual(['#499']))
    expect(app.router.currentRoute.value.query).toEqual({ source: 'walk_in', period: 'today' })
  })

  it('searches by customer, plate (spaces or not) or booking number after you stop typing', async () => {
    const app = await openBookings()
    const type = (text: string) => {
      searchBox().value = text
      searchBox().dispatchEvent(new Event('input'))
    }

    type('shilan')
    await vi.waitFor(() =>
      expect(ids()).toEqual(['#498', '#495', '#492', '#489', '#486', '#483', '#480']),
    )
    expect(app.router.currentRoute.value.query.q).toBe('shilan')

    type('21erb2004')
    await vi.waitFor(() => expect(ids()).toEqual(['#496']))

    type('#478')
    await vi.waitFor(() => expect(ids()).toEqual(['#478']))
  })

  it('says when nothing matches, and clears every filter at once', async () => {
    const app = await openBookings('/garage/bookings?q=nobody&status=active&period=7d')

    expect(searchBox().value).toBe('nobody')
    expect(mainText()).toContain('No bookings match these filters.')
    expect(mainText()).not.toContain('Showing')

    button('Clear filters').click()
    await vi.waitFor(() => expect(ids()).toHaveLength(10))
    expect(app.router.currentRoute.value.query).toEqual({})
    expect(searchBox().value).toBe('')
  })

  it('opens a shared link as it was, ignoring broken values', async () => {
    await openBookings('/garage/bookings?status=paid&source=walk_in&page=x')
    expect(ids()).toEqual(['#499', '#496', '#493', '#490', '#487', '#484', '#481', '#478'])
    expect(button('All').getAttribute('aria-pressed')).toBe('true')
  })

  it('moves back to the last page when the one in the link is past the end', async () => {
    const app = await openBookings('/garage/bookings?page=9')
    await vi.waitFor(() => expect(app.router.currentRoute.value.query).toEqual({ page: '3' }))
    await vi.waitFor(() => expect(ids()).toEqual(['#480', '#479', '#478']))
  })

  it('shows an error with a retry when the list fails', { timeout: 10_000 }, async () => {
    let fail = true
    server.use(
      mock.get('/api/garage/garages/:id/bookings', () =>
        fail ? nestError(500, 'Something went wrong.') : undefined,
      ),
    )
    localStorage.setItem('parkeasy.garage-portal.garage', '5')
    wrapper = (await mountApp('/garage/bookings', { signedInAs: OWNER.me })).wrapper
    // Server errors are retried twice first.
    await vi.waitFor(() => expect(mainText()).toContain("Couldn't load the bookings"), {
      timeout: 8000,
    })

    fail = false
    button('Try again').click()
    await vi.waitFor(() => expect(ids()).toHaveLength(10))
  })

  it('reads in Kurdish', async () => {
    await openBookings('/garage/bookings', 'ckb')

    expect(clean(document.querySelector('h1')?.textContent)).toBe('حیجزەکان')
    expect(document.documentElement.dir).toBe('rtl')
    expect(row(499)).toContain('بێ ئەپ')
    expect(row(499)).toContain('لە دەرچووندا دەدات')
    expect(row(500)).toContain('2 کاتژمێر')
    expect(mainText()).toContain('پیشاندانی 1–10 لە 23 حیجز')
    expect(searchBox().getAttribute('aria-label')).toBe('گەڕان لە حیجزەکان')
  })
})
