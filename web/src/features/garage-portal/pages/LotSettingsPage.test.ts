import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { iraqDay, settingsDb } from '@/test/msw/garage-portal'
import { nestError, OWNER } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  localStorage.clear()
})

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁦-⁩]/g, '').replace(/\s+/g, ' ').trim()
/** Text with a space between elements, as it reads on screen. */
function words(root: Node | null | undefined): string {
  if (!root) return ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const parts: string[] = []
  while (walker.nextNode()) parts.push(walker.currentNode.textContent ?? '')
  return clean(parts.join(' '))
}
const mainText = () => words(document.querySelector('main'))
const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const overrides = () => [...document.querySelectorAll('[data-override]')].map((row) => words(row))

/** A button by its text or aria-label, on the page or in the open dialog. */
function button(label: string, inDialog = false): HTMLButtonElement {
  const root = inDialog ? dialog() : document
  const match = [...(root?.querySelectorAll('button') ?? [])].find(
    (el) => clean(el.textContent) === label || el.getAttribute('aria-label') === label,
  )
  if (!match) throw new Error(`No button "${label}"`)
  return match
}

/** The control a label points to (required fields end in "*"). */
function field(label: string, inDialog = false, kind: 'input' | 'button' = 'input') {
  const root = inDialog ? dialog() : document.querySelector('main')
  const target = [...(root?.querySelectorAll('label') ?? [])].find(
    (el) => clean(el.textContent).replace(/\s*\*$/, '') === label,
  )
  const control = document.getElementById(target?.getAttribute('for') ?? '')
  const expected = kind === 'input' ? HTMLInputElement : HTMLButtonElement
  if (!(control instanceof expected)) throw new Error(`No field "${label}"`)
  return control as HTMLInputElement
}

async function type(label: string, value: string, inDialog = false) {
  const input = field(label, inDialog)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await flushPromises()
}

async function toggle(label: string) {
  field(label, false, 'button').click()
  await flushPromises()
}

/** Every validation message shown under a field. */
const fieldErrors = (root: ParentNode | null = document) =>
  [...(root?.querySelectorAll('[id$="-error"]') ?? [])].map((el) => clean(el.textContent))

/** City Center (id 5): a daily cap and two special prices, one of them today. */
async function openSettings(locale: 'en' | 'ckb' = 'en', garage = '5') {
  localStorage.setItem('parkeasy.garage-portal.garage', garage)
  const app = await mountApp('/garage/settings', { signedInAs: OWNER.me, locale })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(document.querySelector('#lot-settings')).not.toBeNull())
  await flushPromises()
  return app
}

const lastSaved = () => settingsDb.requests.at(-1)

describe('LotSettingsPage', () => {
  it("shows the garage's details, prices, special prices, hours and amenities", async () => {
    await openSettings()

    expect(clean(document.querySelector('h1')?.textContent)).toBe('Settings')
    expect(document.title).toBe('Settings · ParkEasy')
    expect(field('Lot name').value).toBe('City Center Parking')
    expect(field('Price per hour').value).toBe('1500')
    expect(field('Daily cap').value).toBe('9000')
    expect(field('Cap what a car pays per day', false, 'button').getAttribute('aria-checked')).toBe(
      'true',
    )
    expect(clean(document.querySelector('[data-total-slots]')?.textContent)).toBe('30')
    const text = mainText()
    expect(text).toContain('Stays of 6 h or more pay 9,000 IQD for the day.')
    expect(text).toContain('Open 24 hours')
    expect(overrides()).toEqual([
      expect.stringMatching(/^Derby day Now on .* 1 day 2,500 IQD an hour · no daily cap/),
      expect.stringMatching(
        /^Weekend market .* 2 days 2,000 IQD an hour · at most 12,000 IQD a day/,
      ),
    ])
    // Nothing changed yet: nothing to save or discard.
    expect(button('Save changes').disabled).toBe(true)
    expect(button('Discard').disabled).toBe(true)
  })

  it('saves the whole page, and the answer becomes the new starting point', async () => {
    await openSettings()

    await type('Price per hour', '2000')
    expect(mainText()).toContain('Stays of 5 h or more pay 9,000 IQD for the day.')
    expect(mainText()).toContain('Unsaved changes')
    await type('Lot name', '  City Center Parking A  ')
    await toggle('Open 24 hours')
    await type('Opens at', '06:00')
    await type('Closes at', '01:00')

    button('Save changes').click()
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain(
        'Settings saved. New bookings and walk-ins pay the new prices',
      ),
    )
    expect(lastSaved()).toMatchObject({
      name: 'City Center Parking A',
      price_per_hour: 2000,
      daily_cap: 9000,
      is_open_24h: false,
      opening_time: '06:00',
      closing_time: '01:00',
      price_overrides: [
        { label: 'Derby day', price_per_hour: 2500, daily_cap: null },
        { label: 'Weekend market', price_per_hour: 2000, daily_cap: 12000 },
      ],
    })
    await vi.waitFor(() => expect(button('Save changes').disabled).toBe(true))
    expect(field('Lot name').value).toBe('City Center Parking A')
    expect(mainText()).not.toContain('Unsaved changes')
  })

  it("won't send a daily cap below one hour's price, and sends none when it's off", async () => {
    await openSettings()

    await type('Daily cap', '1000')
    button('Save changes').click()
    await vi.waitFor(() => expect(fieldErrors()).toContain("Use at least one hour's price."))
    expect(settingsDb.requests).toHaveLength(0)
    await vi.waitFor(() => expect(document.activeElement).toBe(field('Daily cap')))

    await toggle('Cap what a car pays per day')
    expect(() => field('Daily cap')).toThrow('No field "Daily cap"')
    button('Save changes').click()
    await vi.waitFor(() => expect(lastSaved()).toMatchObject({ daily_cap: null }))
  })

  it('shows what the server refused, and keeps the edits', async () => {
    server.use(
      mock.put('/api/garage/garages/:id/settings', () =>
        nestError(400, '"Weekend market" and "Derby day" share a day.'),
      ),
    )
    await openSettings()
    await type('Lot name', 'City Center Parking A')
    button('Save changes').click()
    await vi.waitFor(() =>
      expect(clean(document.querySelector('main [role="alert"]')?.textContent)).toBe(
        '"Weekend market" and "Derby day" share a day.',
      ),
    )
    expect(field('Lot name').value).toBe('City Center Parking A')
    expect(button('Save changes').disabled).toBe(false)
  })

  it('adds, edits and removes special prices, and keeps them apart', async () => {
    await openSettings()

    button('Add special price').click()
    await vi.waitFor(() => expect(words(dialog())).toContain('Add a special price'))
    // Starts on tomorrow; leaving the name and price empty is caught.
    expect(field('First day', true).value).toBe(iraqDay(1))
    button('Add special price', true).click()
    await vi.waitFor(() => expect(fieldErrors(dialog())).toContain('Fill this in.'))

    await type('Name', 'Eid al-Adha', true)
    await type('First day', iraqDay(10), true)
    await type('Last day', iraqDay(12), true)
    await type('Price per hour', '2500', true)
    button('Add special price', true).click()
    await vi.waitFor(() =>
      expect(fieldErrors(dialog())).toContain('These days overlap Weekend market.'),
    )

    await type('First day', iraqDay(11), true)
    await type('Daily cap', '2000', true)
    button('Add special price', true).click()
    await vi.waitFor(() =>
      expect(fieldErrors(dialog())).toContain("Use at least one hour's price."),
    )
    await type('Daily cap', '', true)
    button('Add special price', true).click()
    await vi.waitFor(() => expect(dialog()).toBeNull())
    expect(overrides()).toHaveLength(3)
    expect(overrides()[2]).toMatch(/^Eid al-Adha .* 2 days 2,500 IQD an hour · no daily cap/)

    button('Edit Eid al-Adha').click()
    await vi.waitFor(() => expect(words(dialog())).toContain('Edit special price'))
    expect(field('Name', true).value).toBe('Eid al-Adha')
    await type('Daily cap', '15000', true)
    button('Update', true).click()
    await vi.waitFor(() => expect(dialog()).toBeNull())
    expect(overrides()[2]).toContain('at most 15,000 IQD a day')

    button('Remove Derby day').click()
    await flushPromises()
    expect(overrides().map((row) => row.split(' ').slice(0, 2).join(' '))).toEqual([
      'Weekend market',
      'Eid al-Adha',
    ])

    button('Save changes').click()
    await vi.waitFor(() => expect(lastSaved()).toBeDefined())
    expect(lastSaved()?.price_overrides).toEqual([
      expect.objectContaining({ label: 'Weekend market' }),
      {
        label: 'Eid al-Adha',
        start_date: iraqDay(11),
        end_date: iraqDay(12),
        price_per_hour: 2500,
        daily_cap: 15000,
      },
    ])
  })

  it('puts everything back with Discard', async () => {
    await openSettings()
    await type('Lot name', 'Something else')
    button('Remove Weekend market').click()
    await flushPromises()

    button('Discard').click()
    await flushPromises()
    expect(field('Lot name').value).toBe('City Center Parking')
    expect(overrides()).toHaveLength(2)
    expect(button('Save changes').disabled).toBe(true)
  })

  it('asks before leaving with unsaved changes', async () => {
    const app = await openSettings()
    await type('Lot name', 'Something else')

    void app.router.push('/garage')
    await vi.waitFor(() => expect(words(dialog())).toContain('Leave without saving?'))
    button('Stay', true).click()
    await vi.waitFor(() => expect(dialog()).toBeNull())
    expect(app.router.currentRoute.value.name).toBe('garage.settings')

    void app.router.push('/garage')
    await vi.waitFor(() => expect(words(dialog())).toContain('Leave without saving?'))
    button('Leave', true).click()
    await vi.waitFor(() => expect(app.router.currentRoute.value.name).toBe('garage.dashboard'))
  })

  it('leaves straight away when nothing changed', async () => {
    const app = await openSettings()
    await app.router.push('/garage')
    expect(app.router.currentRoute.value.name).toBe('garage.dashboard')
    expect(dialog()).toBeNull()
  })

  it('shows a garage without a cap or special prices', async () => {
    await openSettings('en', '3')
    expect(field('Lot name').value).toBe('Bakhtiari Plaza Parking')
    expect(() => field('Daily cap')).toThrow('No field "Daily cap"')
    expect(field('Opens at').value).toBe('07:00')
    expect(mainText()).toContain('No special prices coming up.')
  })

  it('reads in Kurdish, right to left', async () => {
    await openSettings('ckb')
    expect(document.documentElement.dir).toBe('rtl')
    expect(clean(document.querySelector('h1')?.textContent)).toBe('ڕێکخستنەکان')
    expect(field('ناوی پارکینگ').value).toBe('City Center Parking')
    const text = mainText()
    expect(text).toContain('وەستانی 6 کاتژمێر یان زیاتر بۆ ئەو ڕۆژە 9,000 د.ع دەدات.')
    expect(text).toContain('نرخە تایبەتەکان')
    expect(overrides()[0]).toContain('ئێستا کارایە')
  })
})
