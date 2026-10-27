import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { dashboardBody, OWNED_GARAGES } from '@/test/msw/garage-portal'
import { ADMIN, nestError, OWNER } from '@/test/msw/handlers'
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
const sidebar = () => document.querySelector('[id^="dashboard-sidebar"]')
const sidebarText = () => words(sidebar())

async function openDashboard(locale: 'en' | 'ckb' = 'en') {
  const app = await mountApp('/garage', { signedInAs: OWNER.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(document.querySelectorAll('[data-revenue-day]')).toHaveLength(7))
  await flushPromises()
  return app
}

describe('DashboardPage', () => {
  it("shows the owner's first garage with its four headline figures", async () => {
    await openDashboard()

    expect(clean(document.querySelector('h1')?.textContent)).toBe('Dashboard')
    expect(document.documentElement.dataset.portal).toBe('garage')
    // Sorted by name, the first is Bakhtiari Plaza: a quiet garage.
    const text = mainText()
    expect(text).toContain('Occupancy 20% 2 of 10 slots taken')
    expect(text).toContain('Revenue today 0 IQD Nothing yesterday to compare with')
    expect(text).toContain('Active bookings 0 None ending within 30 min')
    expect(text).toContain('Avg. stay — No finished stays this week')
    expect(text).toContain('No bookings yet.')
  })

  it('switches garages from the sidebar and remembers the choice', async () => {
    await openDashboard()
    expect(sidebarText()).toContain('Garage Portal')

    const select = sidebar()?.querySelector<HTMLButtonElement>('[aria-label="Garage"]')
    expect(select).not.toBeNull()
    expect(clean(select?.textContent)).toBe('Bakhtiari Plaza Parking')
    // jsdom has no pointer capture, so open and pick with the keyboard.
    select!.focus()
    select!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
      (o) => clean(o.textContent) === 'City Center Parking',
    )
    expect(option).toBeDefined()
    option!.focus()
    option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await vi.waitFor(() => expect(mainText()).toContain('Occupancy 72% 18 of 25 slots taken'))
    const text = mainText()
    expect(text).toContain('Revenue today 7,500 IQD Up 25% on yesterday')
    expect(text).toContain('Active bookings 4 3 ending within 30 min')
    expect(text).toContain('Avg. stay 2h 15m Down 10% on last week')
    expect(text).toContain('Aram Kamal')
    expect(text).toContain('Deleted account')
    expect(localStorage.getItem('parkeasy.garage-portal.garage')).toBe('5')

    // Back the next time, the dashboard opens on the same garage.
    wrapper?.unmount()
    await openDashboard()
    expect(mainText()).toContain('Occupancy 72%')
  })

  it('shows the garage name without a menu when the owner has one garage', async () => {
    server.use(mock.get('/api/garage/garages', () => HttpResponse.json([OWNED_GARAGES[1]])))
    await openDashboard()

    expect(sidebar()?.querySelector('[aria-label="Garage"]')).toBeNull()
    expect(sidebarText()).toContain('City Center Parking')
  })

  it('says why drivers cannot find a garage that is not approved', async () => {
    const pending = { ...OWNED_GARAGES[0]!, status: 'pending' }
    server.use(
      mock.get('/api/garage/garages', () => HttpResponse.json([pending])),
      mock.get('/api/garage/garages/:id/dashboard', () =>
        HttpResponse.json({ ...dashboardBody(3), garage: pending }),
      ),
    )
    await openDashboard()

    expect(mainText()).toContain(
      "Waiting for ParkEasy's approval: drivers can't find this garage in the app yet.",
    )
  })

  it('explains an account without garages', async () => {
    server.use(mock.get('/api/garage/garages', () => HttpResponse.json([])))
    const app = await mountApp('/garage', { signedInAs: OWNER.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(mainText()).toContain('No garages yet'))
    expect(mainText()).toContain('When ParkEasy links a garage to your account, it shows up here.')
  })

  it('falls back to a garage the owner still has when the saved one is gone', async () => {
    localStorage.setItem('parkeasy.garage-portal.garage', '99')
    await openDashboard()
    expect(mainText()).toContain('Occupancy 20%')
  })

  it('reloads the list when a garage is unlinked while the page is open', async () => {
    let listCalls = 0
    server.use(
      mock.get('/api/garage/garages', () => {
        listCalls++
        return HttpResponse.json(listCalls === 1 ? OWNED_GARAGES : [OWNED_GARAGES[1]])
      }),
      mock.get('/api/garage/garages/3/dashboard', () => nestError(404, 'Parking lot not found.')),
    )
    const app = await mountApp('/garage', { signedInAs: OWNER.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(mainText()).toContain('Occupancy 72%'))
    expect(listCalls).toBe(2)
  })

  it('offers a retry when the dashboard fails', { timeout: 10_000 }, async () => {
    server.use(
      mock.get('/api/garage/garages/:id/dashboard', () => nestError(500, 'SequelizeError: ...')),
    )
    const app = await mountApp('/garage', { signedInAs: OWNER.me })
    wrapper = app.wrapper

    // Server errors are retried twice first.
    await vi.waitFor(() => expect(mainText()).toContain("Couldn't load the dashboard"), {
      timeout: 8000,
    })
    expect(mainText()).toContain('Something went wrong. Please try again.')
    expect(mainText()).not.toContain('Sequelize')
  })

  it('is not for admins: they get "no access" and a way to the garage sign-in', async () => {
    const app = await mountApp('/garage', { signedInAs: ADMIN.me })
    wrapper = app.wrapper
    await flushPromises()

    expect(app.router.currentRoute.value.name).toBe('forbidden')
    expect(document.documentElement.dataset.portal).toBe('garage')
  })

  it('reads in Kurdish, right to left', async () => {
    localStorage.setItem('parkeasy.garage-portal.garage', '5')
    await openDashboard('ckb')

    expect(document.documentElement.dir).toBe('rtl')
    expect(clean(document.querySelector('h1')?.textContent)).toBe('داشبۆرد')
    const text = mainText()
    expect(text).toContain('پڕبوون 72% 18 لە 25 شوێن گیراون')
    expect(text).toContain('تێکڕای مانەوە 2 کاتژمێر و 15 خولەک')
  })
})
