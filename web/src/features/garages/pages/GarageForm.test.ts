import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { garagesDb } from '@/test/msw/garages'
import { ADMIN } from '@/test/msw/handlers'
import { mountApp } from '@/test/mountApp'

/*
 * "Add garage" (from the list) and "Edit details" (from a garage's page): one
 * form, used the way an admin would, against the mocked backend.
 */

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()
const bodyText = () => clean(document.body.textContent)

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')
const dialogText = () => clean(dialog()?.textContent)

/** A button on the page, or inside the dialog when `inDialog` (labels can repeat). */
function button(label: string, inDialog = false): HTMLButtonElement {
  const root = inDialog ? dialog() : document
  const match = [...(root?.querySelectorAll('button') ?? [])].find(
    (el) => clean(el.textContent) === label || el.getAttribute('aria-label') === label,
  )
  if (!match) throw new Error(`No button "${label}"`)
  return match
}

/** The control a form label points to, in the dialog. */
function field(label: string, index = 0, kind: 'input' | 'button' = 'input'): HTMLInputElement {
  const labels = [...(dialog()?.querySelectorAll('label') ?? [])].filter(
    (el) => clean(el.textContent).replace(/\s*\*$/, '') === label,
  )
  const id = labels[index]?.getAttribute('for')
  const input = id ? document.getElementById(id) : null
  const expected = kind === 'input' ? HTMLInputElement : HTMLButtonElement
  if (!(input instanceof expected)) throw new Error(`No field "${label}" #${index}`)
  return input as HTMLInputElement
}

/** Switches and checkboxes: the label points to the control. */
async function toggle(label: string) {
  field(label, 0, 'button').click()
  await flushPromises()
}

async function type(label: string, value: string, index = 0) {
  const input = field(label, index)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await flushPromises()
}

/** Every validation message shown under a field. */
const fieldErrors = () =>
  [...(dialog()?.querySelectorAll('[id$="-error"]') ?? [])].map((el) => clean(el.textContent))

async function openList() {
  const app = await mountApp('/admin/garages', { signedInAs: ADMIN.me })
  wrapper = app.wrapper
  await vi.waitFor(() => expect(bodyText()).toContain('City Center Parking'))
  return app
}

async function openAddDialog() {
  const app = await openList()
  button('Add garage').click()
  await vi.waitFor(() => expect(dialogText()).toContain('Add garage'))
  return app
}

async function fillDetails() {
  await type('Garage name', 'Duhok Gate Parking')
  await type('Address', 'Kawa Avenue')
  await type('City', 'Duhok')
  await type('Map coordinates', '36.8667, 42.9881')
  await type('Price per hour', '1000')
}

describe('Add garage', () => {
  it('shows what to fix and sends nothing while the form is incomplete', async () => {
    await openAddDialog()

    button('Add garage', true).click()

    await vi.waitFor(() => expect(fieldErrors()).toContain('Fill this in.'))
    expect(fieldErrors()).toContain('Enter latitude and longitude, for example 35.5571, 45.4356.')
    expect(garagesDb.saved).toEqual([])
    // The first field to fix gets the focus.
    await vi.waitFor(() => expect(document.activeElement).toBe(field('Garage name')))
  })

  it('adds a garage with its levels and owner, then opens its page', async () => {
    const app = await openAddDialog()
    await fillDetails()

    await type('Slots', '20')
    button('Add level', true).click()
    await flushPromises()
    expect(field('Level', 1).value).toBe('B1')
    await type('Slots', '10', 1)
    expect(dialogText()).toContain('30 slots in total')

    await toggle('Add the owner now')
    await type("Owner's name", 'Aram Jalal')
    await type("Owner's email", 'Aram@Example.com')
    await type("Owner's phone", '0750 333 4455')

    button('Add garage', true).click()

    await vi.waitFor(() => expect(app.router.currentRoute.value.fullPath).toBe('/admin/garages/9'))
    expect(garagesDb.saved).toEqual([
      {
        method: 'POST',
        body: expect.objectContaining({
          name: 'Duhok Gate Parking',
          city: 'Duhok',
          latitude: 36.8667,
          longitude: 42.9881,
          price_per_hour: 1000,
          levels: [
            { level: 'G', slots: 20 },
            { level: 'B1', slots: 10 },
          ],
          owner: { name: 'Aram Jalal', email: 'aram@example.com', phone: '0750 333 4455' },
        }),
      },
    ])
    await vi.waitFor(() => expect(document.querySelector('h1')?.textContent).toContain('Duhok'))
    expect(bodyText()).toContain('Garage added. Drivers can find it in the app now.')
    expect(dialog()).toBeNull()
  })

  it('flags a level listed twice before sending', async () => {
    await openAddDialog()
    await fillDetails()
    await type('Slots', '5')
    button('Add level', true).click()
    await flushPromises()
    await type('Level', 'g', 1)
    await type('Slots', '5', 1)

    button('Add garage', true).click()

    await vi.waitFor(() => expect(fieldErrors()).toContain('This level is already listed.'))
    expect(garagesDb.saved).toEqual([])
  })

  it("keeps the form open with the server's reason when the owner can't be used", async () => {
    await openAddDialog()
    await fillDetails()
    await type('Slots', '5')
    await toggle('Add the owner now')
    await type("Owner's name", 'Karwan Ali')
    await type("Owner's email", 'karwan@example.com')
    await type("Owner's phone", '0750 111 2233')

    button('Add garage', true).click()

    await vi.waitFor(() =>
      expect(clean(dialog()?.querySelector('[role="alert"]')?.textContent)).toBe(
        "karwan@example.com belongs to an account that isn't a garage owner. Use a different email for the owner.",
      ),
    )
    // What was typed is still there to correct.
    expect(field('Garage name').value).toBe('Duhok Gate Parking')
    expect(garagesDb.rows).toHaveLength(8)
  })
})

describe('Edit details', () => {
  async function openEditDialog(id = 5) {
    const app = await mountApp(`/admin/garages/${id}`, { signedInAs: ADMIN.me })
    wrapper = app.wrapper
    await vi.waitFor(() => expect(() => button('Edit details')).not.toThrow())
    button('Edit details').click()
    await vi.waitFor(() => expect(dialogText()).toContain('Edit City Center Parking'))
    return app
  }

  it('opens with the current details and only levels/owner left out', async () => {
    await openEditDialog()

    expect(field('Garage name').value).toBe('City Center Parking')
    expect(field('Map coordinates').value).toBe('35.5571, 45.4356')
    expect(field('Price per hour').value).toBe('1500')
    expect(dialogText()).not.toContain('Levels and slots')
    expect(dialogText()).not.toContain('Add the owner now')
    // Nothing changed yet: nothing to save.
    expect(button('Save changes', true).disabled).toBe(true)
  })

  it('saves only what changed and the page shows it at once', async () => {
    await openEditDialog()

    await type('Garage name', 'City Center Parking (North)')
    await toggle('EV charging')
    expect(button('Save changes', true).disabled).toBe(false)
    button('Save changes', true).click()

    await vi.waitFor(() => expect(dialog()).toBeNull())
    expect(garagesDb.saved).toEqual([
      {
        method: 'PATCH',
        id: 5,
        body: { name: 'City Center Parking (North)', has_ev_charging: true },
      },
    ])
    await vi.waitFor(() =>
      expect(document.querySelector('h1')?.textContent).toContain('City Center Parking (North)'),
    )
    expect(bodyText()).toContain('Garage details saved.')
  })
})
