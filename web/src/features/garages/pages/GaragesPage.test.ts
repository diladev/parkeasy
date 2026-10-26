import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { garagesDb } from '@/test/msw/garages'
import { ADMIN, nestError } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

async function openGarages(path = '/admin/garages') {
  const app = await mountApp(path, { signedInAs: ADMIN.me })
  wrapper = app.wrapper
  // The page is a lazy chunk and the list arrives over (mocked) HTTP.
  await vi.waitFor(() => expect(names().length).toBeGreaterThan(0))
  await flushPromises()
  return app
}

/** Visible text, without the invisible marks that keep names readable in Kurdish. */
const clean = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/[\u2068\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const text = (element: Element | null | undefined) => clean(element?.textContent)
const bodyText = () => clean(document.body.textContent)

/** Garage names in the table, top to bottom. */
const names = () =>
  [...document.querySelectorAll('tbody tr td:first-child span.font-medium')].map((span) =>
    text(span),
  )

function button(label: string | RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((el) =>
    typeof label === 'string' ? text(el) === label : label.test(text(el)),
  )
  if (!match) throw new Error(`No button "${String(label)}"`)
  return match
}

function rowOf(name: string): HTMLTableRowElement {
  const row = [...document.querySelectorAll('tbody tr')].find((tr) => text(tr).includes(name))
  if (!(row instanceof HTMLTableRowElement)) throw new Error(`No row for ${name}`)
  return row
}

const lastRequest = () => garagesDb.requests.at(-1)

describe('GaragesPage', () => {
  it('lists every garage with its owner, revenue, status and the counts per status', async () => {
    await openGarages()

    expect(names()).toHaveLength(8)
    const cityCenter = text(rowOf('City Center Parking'))
    expect(cityCenter).toContain('Sardar Ghafur')
    expect(cityCenter).toContain('7,500 IQD')
    expect(cityCenter).toContain('4.6')
    expect(cityCenter).toContain('Approved')
    expect(text(rowOf('Zagros Park Deck'))).toContain('No owner yet')

    expect(button('All · 8').getAttribute('aria-pressed')).toBe('true')
    expect(button('Pending · 2')).toBeTruthy()
    expect(button('Suspended · 1')).toBeTruthy()
    expect(bodyText()).toContain('Showing 1–8 of 8')
    expect(document.title).toBe('Garages · ParkEasy')
  })

  it('filters by status through the URL', async () => {
    const app = await openGarages()

    button('Pending · 2').click()
    await vi.waitFor(() => expect(names()).toEqual(['Ankawa Mall Parking', 'Zagros Park Deck']))

    expect(app.router.currentRoute.value.fullPath).toBe('/admin/garages?status=pending')
    expect(lastRequest()?.get('status')).toBe('pending')
    expect(button('Pending · 2').getAttribute('aria-pressed')).toBe('true')
  })

  it('searches after you stop typing, and offers to clear an empty search', async () => {
    const app = await openGarages()
    const input = document.querySelector<HTMLInputElement>('input[type="search"]')!

    input.value = 'erbil'
    input.dispatchEvent(new Event('input'))
    await vi.waitFor(() => expect(names()).toEqual(['Ankawa Mall Parking', 'Citadel Parking']))
    expect(app.router.currentRoute.value.query.q).toBe('erbil')
    expect(button('All · 2')).toBeTruthy()

    input.value = 'nothing like this'
    input.dispatchEvent(new Event('input'))
    await vi.waitFor(() => expect(bodyText()).toContain('No garages found'))

    button('Clear search').click()
    await vi.waitFor(() => expect(names()).toHaveLength(8))
    expect(app.router.currentRoute.value.query.q).toBeUndefined()
  })

  it('opens straight on a shared link, ignoring broken values', async () => {
    await openGarages('/admin/garages?status=suspended&page=abc')
    expect(names()).toEqual(['Sarchinar Night Parking'])
    expect(lastRequest()?.get('page')).toBe('1')
  })

  it('approves a pending garage and shows the server message', async () => {
    await openGarages('/admin/garages?status=pending')

    button(/^Approve Zagros Park Deck$/).click()

    await vi.waitFor(() =>
      expect(bodyText()).toContain('Garage approved. Drivers can find it in the app now.'),
    )
    // Refetched: the approved garage leaves the Pending filter and the count drops.
    await vi.waitFor(() => expect(names()).toEqual(['Ankawa Mall Parking']))
    expect(button('Pending · 1')).toBeTruthy()
  })

  it('asks before suspending, and does nothing when cancelled', async () => {
    await openGarages()

    button(/^Suspend City Center Parking$/).click()
    await vi.waitFor(() => expect(bodyText()).toContain('Suspend City Center Parking?'))
    button('Cancel').click()
    await flushPromises()
    expect(garagesDb.rows.find((row) => row.id === 5)?.status).toBe('approved')

    button(/^Suspend City Center Parking$/).click()
    await vi.waitFor(() => expect(() => button('Suspend garage')).not.toThrow())
    button('Suspend garage').click()

    await vi.waitFor(() => expect(text(rowOf('City Center Parking'))).toContain('Suspended'))
    expect(button(/^Restore City Center Parking$/)).toBeTruthy()
  })

  it("shows the server's reason when the change is refused", async () => {
    await openGarages()
    // Someone else approved it meanwhile.
    garagesDb.rows.find((row) => row.id === 1)!.status = 'approved'

    button(/^Approve Ankawa Mall Parking$/).click()

    await vi.waitFor(() => expect(bodyText()).toContain("This garage's status has changed"))
  })

  it('offers a retry when the list fails to load', async () => {
    server.use(mock.get('/api/admin/garages', () => nestError(500, 'boom'), { once: true }))
    server.use(mock.get('/api/admin/garages', () => nestError(500, 'boom'), { once: true }))
    server.use(mock.get('/api/admin/garages', () => nestError(500, 'boom'), { once: true }))
    const app = await mountApp('/admin/garages', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain("Couldn't load the garages"), {
      timeout: 5000,
    })
    expect(bodyText()).not.toContain('boom')

    button('Try again').click()
    await vi.waitFor(() => expect(names()).toHaveLength(8))
  })

  it('pages through long lists', async () => {
    garagesDb.rows.push(
      ...Array.from({ length: 4 }, (_, i) => ({
        ...garagesDb.rows[1]!,
        id: 50 + i,
        name: `Zz Extra Lot ${i + 1}`,
      })),
    )
    const app = await openGarages()
    expect(bodyText()).toContain('Showing 1–10 of 12')

    await app.router.push('/admin/garages?page=2')
    await vi.waitFor(() => expect(names()).toEqual(['Zz Extra Lot 3', 'Zz Extra Lot 4']))
    expect(bodyText()).toContain('Showing 11–12 of 12')
  })

  it('is in the admin menu', async () => {
    await openGarages()
    const link = [...document.querySelectorAll('nav a')].find((a) => text(a) === 'Garages')
    expect(link?.getAttribute('href')).toBe('/admin/garages')
    expect(link?.getAttribute('aria-current')).toBe('page')
    // Only one menu item is the current page (Overview's /admin is a prefix of every page).
    expect(document.querySelectorAll('nav a[aria-current="page"]')).toHaveLength(1)
  })

  it('works in Kurdish', async () => {
    const app = await mountApp('/admin/garages', { signedInAs: ADMIN.me, locale: 'ckb' })
    wrapper = app.wrapper
    await vi.waitFor(() => expect(names().length).toBeGreaterThan(0))

    expect(text(document.querySelector('thead'))).toContain('گەراج')
    expect(bodyText()).toContain('چاوەڕوان · 2')
    expect(text(rowOf('City Center Parking'))).toContain('7,500 د.ع')
  })

  it('re-checks access with the server after a 403 and leaves when it is gone', async () => {
    let meCalls = 0
    server.use(
      mock.get('/api/admin/garages', () => nestError(403, "You don't have permission to do this.")),
      mock.get('/api/user/local/me', () => {
        meCalls++
        return HttpResponse.json({ ...ADMIN.me, role: 'driver', permissions: [] })
      }),
    )
    const app = await mountApp('/admin/garages', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(app.router.currentRoute.value.name).toBe('forbidden'))
    expect(meCalls).toBe(1)
  })
})
