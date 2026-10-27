import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADMIN, nestError } from '@/test/msw/handlers'
import { overviewBody } from '@/test/msw/overview'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

const clean = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/[\u2068\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const bodyText = () => clean(document.body.textContent)
/** Text with a space between elements, as it reads on screen. */
function words(root: Node | null): string {
  if (!root) return ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '')
  return clean(parts.join(' '))
}
const section = (title: string) => {
  const heading = [...document.querySelectorAll('h2')].find((h) => clean(h.textContent) === title)
  return heading?.closest('section') ?? null
}

async function openOverview(locale: 'en' | 'ckb' = 'en') {
  const app = await mountApp('/admin', { signedInAs: ADMIN.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(document.querySelectorAll('[data-revenue-day]')).toHaveLength(7))
  await flushPromises()
  return app
}

describe('OverviewPage', () => {
  it('shows the four headline figures with their comparisons', async () => {
    await openOverview()

    const text = words(document.querySelector('main'))
    expect(clean(document.querySelector('h1')?.textContent)).toBe('Platform overview')
    expect(text).toContain('Total users 1,082 Up 8.2% this month')
    expect(text).toContain('Garages 8 2 pending approval')
    expect(text).toContain("Today's bookings 9 Down 25% on yesterday")
    expect(text).toContain('Revenue · this month 64,000 IQD Up 28% on last month so far')
  })

  it('draws 7 days of revenue, each with its amount for hover, keyboard and screen readers', async () => {
    await openOverview()

    const chart = section('Platform revenue · last 7 days')!
    expect(clean(chart.textContent)).toContain('42,500 IQD in total')
    const days = [...chart.querySelectorAll<HTMLElement>('[data-revenue-day]')]
    expect(days.map((day) => day.getAttribute('aria-label'))).toEqual([
      'Wed: 4,500 IQD',
      'Thu: 0 IQD',
      'Fri: 12,000 IQD',
      'Sat: 6,000 IQD',
      'Sun: 3,000 IQD',
      'Mon: 9,500 IQD',
      'Tue: 7,500 IQD',
    ])
    expect(days.every((day) => day.tabIndex === 0)).toBe(true)
    // Axis tops out at a round number above the best day (12,000 -> 20K).
    expect(clean(chart.textContent)).toContain('20K')
    // The tallest column is 12,000 of 20,000.
    const columns = days.map((day) => (day.firstElementChild as HTMLElement).style.height)
    expect(columns[2]).toBe('60%')
    expect(columns[1]).toBe('0%')
    expect(chart.querySelectorAll('table tbody tr')).toHaveLength(7)
  })

  it('ranks the top garages and links them', async () => {
    await openOverview()

    const top = section('Top garages · last 7 days')!
    expect(words(top)).toContain('City Center Parking Sulaymaniyah 18,000 IQD')
    expect(top.querySelector('a')?.getAttribute('href')).toBe('/admin/garages/5')
  })

  it('lists recent sign-ups with today/yesterday and links to their pages', async () => {
    await openOverview()

    const signups = section('Recent sign-ups')!
    const rows = [...signups.querySelectorAll('tbody tr')].map((row) => words(row))
    expect(rows[0]).toMatch(
      /^Zhino Ali Driver zhino@example.com \+964 750 221 3345 Today · \d\d:\d\d Active$/,
    )
    expect(rows[1]).toMatch(/Garage owner .* Yesterday · \d\d:\d\d Suspended$/)
    expect(signups.querySelector('tbody a')?.getAttribute('href')).toBe('/admin/users/12')
  })

  it('says so instead of showing comparisons that mean nothing', async () => {
    server.use(
      mock.get('/api/admin/overview', () =>
        HttpResponse.json({
          ...overviewBody(),
          users: { total: 5, new_this_month: 0 },
          garages: { total: 3, pending: 0 },
          bookings_today: { today: 2, yesterday: 0 },
          revenue_month: { to_date: 0, previous_to_date: 0 },
          top_garages: [],
        }),
      ),
    )
    await openOverview()

    const text = bodyText()
    expect(text).toContain('No new users this month')
    expect(text).toContain('None waiting for approval')
    expect(text).toContain('None yesterday to compare with')
    expect(text).toContain('Nothing last month to compare with')
    expect(text).toContain('No paid bookings in the last 7 days.')
  })

  it('shows a retry when the overview cannot load', async () => {
    server.use(mock.get('/api/admin/overview', () => nestError(500, 'boom')))
    const app = await mountApp('/admin', { signedInAs: ADMIN.me })
    wrapper = app.wrapper

    await vi.waitFor(() => expect(bodyText()).toContain("Couldn't load the overview"), {
      timeout: 5000,
    })
    expect(bodyText()).not.toContain('boom')
  }, 10_000)

  it('works in Kurdish, with Kurdish weekday names', async () => {
    await openOverview('ckb')

    expect(document.documentElement.dir).toBe('rtl')
    const firstDay = document.querySelector('[data-revenue-day]')
    expect(firstDay?.getAttribute('aria-label')).toBe('چوارشەممە: 4,500 د.ع')
    expect(bodyText()).toContain('حیجزەکانی ئەمڕۆ')
  })
})
