import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADMIN, nestError } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { usersDb } from '@/test/msw/users'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()
const bodyText = () => clean(document.body.textContent)

/** User names in the table, top to bottom. */
const names = () =>
  [...document.querySelectorAll('tbody a[data-user-name]')].map((a) => clean(a.textContent))

function button(label: string): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find(
    (el) => clean(el.textContent) === label,
  )
  if (!match) throw new Error(`No button "${label}"`)
  return match
}

function rowOf(name: string): string {
  const row = [...document.querySelectorAll('tbody tr')].find((tr) =>
    clean(tr.textContent).includes(name),
  )
  if (!row) throw new Error(`No row for ${name}`)
  return clean(row.textContent)
}

async function openUsers(path = '/admin/users', locale: 'en' | 'ckb' = 'en') {
  const app = await mountApp(path, { signedInAs: ADMIN.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(names().length).toBeGreaterThan(0))
  await flushPromises()
  return app
}

const lastListRequest = () =>
  usersDb.requests.filter((request) => request.path === '/api/admin/users').at(-1)?.params

describe('UsersPage', () => {
  it('lists accounts newest first with role, bookings, wallet and status', async () => {
    await openUsers()

    expect(names()).toEqual([
      'Dilan K.',
      'Sardar Ghafur',
      'Hemin Aziz',
      'Karwan Omer',
      'Lana Rashid',
      'Shilan Ahmed',
      'Aram Hassan',
    ])
    const aram = rowOf('Aram Hassan')
    expect(aram).toContain('Driver')
    expect(aram).toContain('aram@example.com')
    expect(aram).toContain('+964 750 100 0001')
    expect(aram).toContain('23,000 IQD')
    expect(aram).toContain('Jan 2026')
    expect(aram).toContain('Active')
    expect(rowOf('Hemin Aziz')).toContain('Suspended')
    expect(rowOf('Sardar Ghafur')).toContain('Garage owner')

    expect(button('All · 7').getAttribute('aria-pressed')).toBe('true')
    expect(button('Drivers · 5')).toBeTruthy()
    expect(button('Garage owners · 1')).toBeTruthy()
    expect(bodyText()).toContain('Showing 1–7 of 7 users')
    expect(document.title).toBe('Users · ParkEasy')
  })

  it('filters by role through the URL', async () => {
    const app = await openUsers()

    button('Garage owners · 1').click()

    await vi.waitFor(() => expect(names()).toEqual(['Sardar Ghafur']))
    expect(app.router.currentRoute.value.fullPath).toBe('/admin/users?role=garage_owner')
    expect(lastListRequest()?.get('role')).toBe('garage_owner')
  })

  it('searches after typing stops and keeps the search in the URL', async () => {
    const app = await openUsers()
    const input = document.querySelector<HTMLInputElement>('input[type="search"]')!

    input.value = 'lana'
    input.dispatchEvent(new Event('input'))

    await vi.waitFor(() => expect(names()).toEqual(['Lana Rashid']), { timeout: 2000 })
    expect(app.router.currentRoute.value.query).toEqual({ q: 'lana' })
  })

  it('offers to clear a search that finds nobody', async () => {
    const app = await mountApp('/admin/users?q=nobody-here', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain('No users found'))
    button('Clear search').click()

    await vi.waitFor(() => expect(names()).toHaveLength(7))
  }, 10_000)

  it('exports the accounts that match the current filters', async () => {
    Object.assign(URL, {
      createObjectURL: vi.fn<(blob: Blob) => string>(() => 'blob:users'),
      revokeObjectURL: vi.fn<(url: string) => void>(),
    })
    const downloads: string[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download)
    })
    await openUsers('/admin/users?role=driver&q=a')

    button('Export CSV').click()

    await vi.waitFor(() => expect(downloads).toEqual(['parkeasy-users-2026-10-26.csv']))
    const exportRequest = usersDb.requests.find((request) => request.path.endsWith('/export'))
    expect(Object.fromEntries(exportRequest!.params)).toEqual({ role: 'driver', q: 'a' })
  })

  it('shows a retry when the list cannot load', async () => {
    server.use(mock.get('/api/admin/users', () => nestError(500, 'boom')))
    const app = await mountApp('/admin/users', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain("Couldn't load the users"), {
      timeout: 5000,
    })
    expect(bodyText()).not.toContain('boom')
  }, 10_000)

  it('works in Kurdish', async () => {
    await openUsers('/admin/users', 'ckb')

    expect(document.documentElement.dir).toBe('rtl')
    expect(button('شۆفێران · 5')).toBeTruthy()
    expect(rowOf('Hemin Aziz')).toContain('ڕاگیراو')
  })
})
