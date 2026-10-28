import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { garagesDb } from '@/test/msw/garages'
import { ADMIN, nestError } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()
const bodyText = () => clean(document.body.textContent)
const section = (title: string) => {
  const heading = [...document.querySelectorAll('h2')].find((h) => clean(h.textContent) === title)
  return clean(heading?.closest('section')?.textContent)
}

function button(label: string): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find(
    (el) => clean(el.textContent) === label,
  )
  if (!match) throw new Error(`No button "${label}"`)
  return match
}

async function openGarage(id: number, locale: 'en' | 'ckb' = 'en') {
  const app = await mountApp(`/admin/garages/${id}`, { signedInAs: ADMIN.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(document.querySelector('h2')).not.toBeNull())
  await flushPromises()
  return app
}

describe('GarageDetailPage', () => {
  it('shows the garage name in the heading, the breadcrumb and the browser tab', async () => {
    await openGarage(5)

    expect(clean(document.querySelector('h1')?.textContent)).toBe('City Center Parking')
    const crumb = document.querySelector('nav[aria-label="Breadcrumb"] a')
    expect(clean(crumb?.textContent)).toBe('Garages')
    expect(crumb?.getAttribute('href')).toBe('/admin/garages')
    expect(document.title).toBe('City Center Parking · ParkEasy')
    // Still under Garages in the menu.
    const current = [...document.querySelectorAll('nav a')].filter((a) =>
      a.className.includes('text-primary'),
    )
    expect(current.map((a) => clean(a.textContent))).toEqual(['Garages'])
  })

  it('shows the owner, the figures and the comparison with the month before', async () => {
    await openGarage(5)

    expect(bodyText()).toContain('Owner: Sardar Ghafur (owner5@example.com)')
    const ownerLink = [...document.querySelectorAll('a')].find(
      (a) => clean(a.textContent) === 'Sardar Ghafur',
    )
    expect(ownerLink?.getAttribute('href')).toBe('/admin/users/105')
    expect(bodyText()).toContain('Added Jan 2026')
    expect(bodyText()).toContain('5 of 28 slots taken')
    expect(bodyText()).toContain('18%')
    expect(bodyText()).toContain('7,500 IQD')
    expect(bodyText()).toContain('Up 150% on the 30 days before')
    expect(bodyText()).toContain('4.6 ★')
  })

  it('shows the lot settings and every level, top floor first', async () => {
    await openGarage(5)

    const settings = section('Lot settings')
    expect(settings).toContain('1,500 IQD')
    expect(settings).toMatch(/Daily cap\s*9,000 IQD/)
    expect(settings).toContain('Open 24 hours')
    expect(settings).toContain('30 min after the start')
    expect(settings).toContain('CCTV')
    expect(settings).not.toContain('EV charging')

    const levels = section('Occupancy by level')
    expect(levels).toContain('Ground floor (G)')
    expect(levels).toContain('7 of 8 taken · 88%')
    expect(levels.indexOf('Basement 1')).toBeLessThan(levels.indexOf('Basement 2'))
    const map = [...document.querySelectorAll('a')].find((a) =>
      clean(a.textContent).startsWith('View on map'),
    )
    expect(map?.getAttribute('target')).toBe('_blank')
    expect(map?.getAttribute('rel')).toContain('noopener')
  })

  it('lists recent bookings, including early ends and deleted accounts', async () => {
    await openGarage(5)

    const bookings = section('Recent bookings')
    expect(bookings).toContain('#10')
    expect(bookings).toContain('Lana Rashid')
    expect(bookings).toContain('Toyota Hilux · 22 SUL 61902')
    expect(bookings).toContain('B2 · A01')
    expect(bookings).toContain('26 Oct 2026, 12:43') // Iraq time
    expect(bookings).toContain('4,500 IQD')
    expect(bookings).toContain('Active')
    expect(bookings).toContain('Ended early')
    expect(bookings).toContain('Deleted account')
  })

  it('handles a garage without slots, bookings or history', async () => {
    await openGarage(8)

    expect(bodyText()).toContain('No owner yet')
    expect(bodyText()).toContain('Nothing to compare with yet')
    expect(bodyText()).toContain('No slots yet.')
    expect(bodyText()).toContain('No bookings yet.')
  })

  it('suspends after confirming, and the page follows the new status', async () => {
    await openGarage(5)

    button('Suspend garage').click()
    await vi.waitFor(() => expect(bodyText()).toContain('Suspend City Center Parking?'))
    // The dialog's own button has the same label as the page's: take the last one.
    const confirm = [...document.querySelectorAll('[role="dialog"] button')].find(
      (el) => clean(el.textContent) === 'Suspend garage',
    ) as HTMLButtonElement
    confirm.click()

    await vi.waitFor(() => expect(() => button('Restore garage')).not.toThrow())
    expect(garagesDb.rows.find((row) => row.id === 5)?.status).toBe('suspended')
    expect(bodyText()).toContain("Garage suspended. It's hidden from the app")
  })

  it('approves a pending garage without asking', async () => {
    await openGarage(1)

    button('Approve garage').click()

    await vi.waitFor(() => expect(() => button('Suspend garage')).not.toThrow())
    expect(garagesDb.rows.find((row) => row.id === 1)?.status).toBe('approved')
  })

  it('says so when the garage does not exist', async () => {
    const app = await mountApp('/admin/garages/999', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain('Garage not found'))
    const back = [...document.querySelectorAll('a')].find(
      (a) => clean(a.textContent) === 'Back to garages',
    )
    expect(back?.getAttribute('href')).toBe('/admin/garages')
  })

  it('treats a non-numeric id as a missing page', async () => {
    const app = await mountApp('/admin/garages/abc', { signedInAs: ADMIN.me })
    wrapper = app.wrapper
    expect(app.router.currentRoute.value.name).toBe('not-found')
  })

  it('offers a retry when loading fails', async () => {
    for (let i = 0; i < 3; i++) {
      server.use(mock.get('/api/admin/garages/:id', () => nestError(500, 'boom'), { once: true }))
    }
    const app = await mountApp('/admin/garages/5', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain("Couldn't load this garage"), {
      timeout: 5000,
    })
    button('Try again').click()
    await vi.waitFor(() => expect(bodyText()).toContain('Lot settings'))
  })

  it('works in Kurdish', async () => {
    await openGarage(5, 'ckb')

    expect(bodyText()).toContain('ڕێکخستنەکانی پارکینگ')
    expect(bodyText()).toContain('نهۆمی زەوی')
    expect(bodyText()).toContain('7,500 د.ع')
    expect(bodyText()).toContain('150% زیاتر لە 30 ڕۆژی پێشوو')
  })
})
