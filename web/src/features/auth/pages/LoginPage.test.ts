import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADMIN, API, nestError, OWNER } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

/** The input a <label> points at, the way a screen reader finds it. */
function field(label: string): HTMLInputElement {
  const labelEl = [...document.querySelectorAll('label')].find(
    (l) => l.textContent?.trim() === label,
  )
  const input = labelEl && document.getElementById(labelEl.htmlFor)
  if (!(input instanceof HTMLInputElement)) throw new Error(`No input labelled "${label}"`)
  return input
}

async function type(label: string, value: string) {
  const input = field(label)
  input.value = value
  input.dispatchEvent(new Event('input'))
  await flushPromises()
}

async function submit() {
  document.querySelector('form')?.dispatchEvent(new Event('submit'))
  await flushPromises()
  await flushPromises()
}

const alertText = () => document.querySelector('[role="alert"]')?.textContent?.trim() ?? ''

describe('LoginPage · Admin Panel', () => {
  it('signs an admin in and opens the overview', async () => {
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    await type('Email', ADMIN.email)
    await type('Password', ADMIN.password)
    await submit()

    // The admin layout and page are lazy chunks: wait for them to load.
    await vi.waitFor(() => {
      expect(app.router.currentRoute.value.name).toBe('admin.overview')
      expect(document.querySelector('h1')?.textContent).toContain('Platform overview')
      expect(document.body.textContent).toContain('Dilan K.')
    })
  })

  it('checks the fields before calling the server', async () => {
    let calls = 0
    server.use(
      mock.post(`${API}/login`, () => {
        calls++
        return HttpResponse.json({})
      }),
    )
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    await type('Email', 'not-an-email')
    await submit()

    expect(document.body.textContent).toContain('Enter a valid email address.')
    expect(document.body.textContent).toContain('Enter your password.')
    expect(field('Email').getAttribute('aria-invalid')).toBe('true')
    expect(calls).toBe(0)
  })

  it("shows the server's message for a wrong password and clears the password", async () => {
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    await type('Email', ADMIN.email)
    await type('Password', 'wrong-password')
    await submit()

    expect(alertText()).toBe('Invalid email or password.')
    expect(field('Password').value).toBe('')
    expect(app.router.currentRoute.value.name).toBe('admin.login')
  })

  it('explains when the account may not use the admin panel', async () => {
    server.use(mock.post(`${API}/login`, () => nestError(403, "This account can't sign in here.")))
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    await type('Email', 'aram@example.com')
    await type('Password', 'Demo@1234')
    await submit()

    expect(alertText()).toBe("This account can't sign in here.")
  })

  it('uses its own words when the server is unreachable or fails', async () => {
    server.use(mock.post(`${API}/login`, () => HttpResponse.error()))
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    await type('Email', ADMIN.email)
    await type('Password', ADMIN.password)
    await submit()
    expect(alertText()).toBe("Can't reach the server. Check your connection and try again.")

    server.use(mock.post(`${API}/login`, () => nestError(500, 'SequelizeDatabaseError: ...')))
    await type('Password', ADMIN.password)
    await submit()
    expect(alertText()).toBe('Something went wrong. Please try again.')
  })

  it('tells the user why they are back after the session ended', async () => {
    const app = await mountApp('/admin/login?reason=expired')
    wrapper = app.wrapper

    expect(alertText()).toBe('Your session ended. Please sign in again.')
  })

  it('works in Kurdish, right to left, and asks the server for Kurdish messages', async () => {
    let lang: string | null = null
    server.use(
      mock.post(`${API}/login`, ({ request }) => {
        lang = request.headers.get('x-lang')
        return nestError(401, 'ئیمەیڵ یان وشەی نهێنی هەڵەیە.')
      }),
    )
    const app = await mountApp('/admin/login', { locale: 'ckb' })
    wrapper = app.wrapper

    expect(document.documentElement.dir).toBe('rtl')
    await type('ئیمەیڵ', ADMIN.email)
    await type('وشەی نهێنی', 'x')
    await submit()

    expect(lang).toBe('ckb')
    expect(alertText()).toBe('ئیمەیڵ یان وشەی نهێنی هەڵەیە.')
  })

  it('links to the password reset of the same portal', async () => {
    const app = await mountApp('/admin/login')
    wrapper = app.wrapper

    const link = [...document.querySelectorAll('a')].find(
      (a) => a.textContent?.trim() === 'Forgot password?',
    )
    expect(link?.getAttribute('href')).toBe('/admin/forgot-password')
  })

  it('confirms a finished password reset', async () => {
    const app = await mountApp('/admin/login?reason=reset')
    wrapper = app.wrapper

    expect(alertText()).toBe('Your password has been reset. You can now sign in.')
  })
})

describe('LoginPage · Garage Portal', () => {
  it('signs an owner in and opens their dashboard, in teal', async () => {
    let portal: unknown
    server.use(
      mock.post(`${API}/login`, async ({ request }) => {
        portal = ((await request.clone().json()) as { portal?: string }).portal
        return undefined // fall through to the default handler
      }),
    )
    const app = await mountApp('/garage/login')
    wrapper = app.wrapper

    expect(document.querySelector('h1')?.textContent?.trim()).toBe('Sign in to your portal')
    expect(document.documentElement.dataset.portal).toBe('garage')
    expect(document.body.textContent).toContain('Live slot monitoring in real time')

    await type('Email', OWNER.email)
    await type('Password', OWNER.password)
    await submit()

    expect(portal).toBe('garage')
    await vi.waitFor(() => {
      expect(app.router.currentRoute.value.name).toBe('garage.dashboard')
      expect(document.body.textContent).toContain('Sardar Ghafur')
    })
  })

  it("explains that an admin account can't use the Garage Portal", async () => {
    const app = await mountApp('/garage/login')
    wrapper = app.wrapper

    await type('Email', ADMIN.email)
    await type('Password', ADMIN.password)
    await submit()

    expect(alertText()).toBe("This account can't sign in here.")
    expect(app.router.currentRoute.value.name).toBe('garage.login')
  })

  it('goes back to the admin colours on the Admin Panel', async () => {
    const app = await mountApp('/garage/login')
    wrapper = app.wrapper
    expect(document.documentElement.dataset.portal).toBe('garage')

    await app.router.push('/admin/login')
    await flushPromises()
    expect(document.documentElement.dataset.portal).toBe('admin')
    expect(document.body.textContent).not.toContain('Live slot monitoring in real time')
  })
})
