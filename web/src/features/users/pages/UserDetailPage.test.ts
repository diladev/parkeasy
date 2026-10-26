import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADMIN } from '@/test/msw/handlers'
import { usersDb } from '@/test/msw/users'
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

function button(label: string, inDialog = false): HTMLButtonElement {
  const root = inDialog ? document.querySelector('[role="dialog"]') : document
  const match = [...(root?.querySelectorAll('button') ?? [])].find(
    (el) => clean(el.textContent) === label,
  )
  if (!match) throw new Error(`No button "${label}"`)
  return match
}

async function openUser(id: number) {
  const app = await mountApp(`/admin/users/${id}`, { signedInAs: ADMIN.me })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(document.querySelector('main h2')).not.toBeNull())
  await flushPromises()
  return app
}

describe('UserDetailPage', () => {
  it("shows the person's name in the heading, breadcrumb and tab", async () => {
    await openUser(1)

    expect(clean(document.querySelector('h1')?.textContent)).toBe('Aram Hassan')
    expect(clean(document.querySelector('nav[aria-label="Breadcrumb"]')?.textContent)).toContain(
      'Users',
    )
    expect(document.title).toBe('Aram Hassan · ParkEasy')
  })

  it('shows stats, vehicles, wallet activity and bookings', async () => {
    await openUser(1)

    const text = bodyText()
    expect(text).toContain('aram@example.com')
    expect(text).toContain('4 this week')
    expect(text).toContain('23,000 IQD')
    expect(text).toContain('Last top-up: 15,000 IQD on 16 Oct 2026, 18:05')
    expect(text).toContain('15,000 IQD')
    expect(text).toContain('All within free cancellation')

    expect(section('Vehicles')).toContain('2 saved')
    expect(section('Vehicles')).toContain('Toyota Corolla')
    expect(section('Vehicles')).toContain('White · 2019 · 22 SUL 48213')
    expect(section('Vehicles')).toContain('Default')

    const wallet = section('Wallet activity')
    expect(wallet).toContain('Booking · City Center Parking')
    expect(wallet).toContain('−3,000 IQD')
    expect(wallet).toContain('Refund · City Center Parking')
    expect(wallet).toContain('+4,500 IQD')
    expect(wallet).toContain('Top-up')

    const bookings = section('Bookings')
    expect(bookings).toContain('#12')
    expect(bookings).toContain('B1 · A03')
    expect(bookings).toContain('2h')
    expect(bookings).toContain('Cancelled')
    const garageLink = [...document.querySelectorAll('a')].find(
      (a) => clean(a.textContent) === 'City Center Parking',
    )
    expect(garageLink?.getAttribute('href')).toBe('/admin/garages/5')
  })

  it('lists the garages an owner runs instead of vehicles', async () => {
    await openUser(6)

    expect(section('Garages they run')).toContain('Bakhtiari Plaza Parking')
    expect(section('Garages they run')).toContain('City Center Parking')
    expect(bodyText()).not.toContain('Vehicles')
  })

  it('suspends after confirming, then offers to restore', async () => {
    await openUser(3)

    button('Suspend user').click()
    await vi.waitFor(() => expect(bodyText()).toContain('Suspend Lana Rashid?'))
    button('Suspend user', true).click()

    await vi.waitFor(() => expect(() => button('Restore user')).not.toThrow())
    expect(usersDb.rows.find((row) => row.id === 3)?.status).toBe('suspended')
    expect(bodyText()).toContain("Account suspended. They're signed out")
    // A suspended account can't be sent a reset until it's restored.
    expect(button('Send password reset').disabled).toBe(true)

    button('Restore user').click()
    await vi.waitFor(() => expect(() => button('Suspend user')).not.toThrow())
    expect(usersDb.rows.find((row) => row.id === 3)?.status).toBe('active')
  })

  it('sends a password reset and says where it went', async () => {
    await openUser(1)

    button('Send password reset').click()

    await vi.waitFor(() =>
      expect(bodyText()).toContain('A password reset code was emailed to aram@example.com.'),
    )
    expect(usersDb.resets).toEqual([1])
  })

  it('offers no suspend button for admin accounts', async () => {
    await openUser(7)

    expect(() => button('Suspend user')).toThrow('No button')
    expect(button('Send password reset')).toBeTruthy()
  })

  it('says so when the account does not exist', async () => {
    const app = await mountApp('/admin/users/999', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain('User not found'))
    const back = [...document.querySelectorAll('a')].find(
      (a) => clean(a.textContent) === 'Back to users',
    )
    expect(back?.getAttribute('href')).toBe('/admin/users')
  })
})
