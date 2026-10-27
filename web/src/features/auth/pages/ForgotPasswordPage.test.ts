import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http as mock, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { API, nestError, OWNER, RESET_CODE, RESET_TOKEN } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { mountApp } from '@/test/mountApp'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  server.events.removeAllListeners()
})

const clean = (value: string | null | undefined) =>
  (value ?? '').replace(/[⁨⁩]/g, '').replace(/\s+/g, ' ').trim()

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

function button(text: string): HTMLButtonElement {
  const found = [...document.querySelectorAll('button')].find((b) => clean(b.textContent) === text)
  if (!found) throw new Error(`No button "${text}"`)
  return found
}

const heading = () => clean(document.querySelector('h1')?.textContent)
const alertText = () => clean(document.querySelector('[role="alert"]')?.textContent)
const statusText = () => clean(document.querySelector('[role="status"]')?.textContent)

/** Records what each reset request sent, then lets the default handler answer. */
function recordRequests() {
  const sent: Record<string, unknown>[] = []
  const record = async ({ request }: { request: Request }) => {
    const body = (await request.clone().json()) as Record<string, unknown>
    sent.push({ url: new URL(request.url).pathname, ...body })
    return undefined
  }
  server.use(
    mock.post(`${API}/forgot-password`, record),
    mock.post(`${API}/verify-otp`, record),
    mock.post(`${API}/reset-password`, record),
  )
  return sent
}

async function openReset(path = '/garage/forgot-password') {
  const app = await mountApp(path)
  wrapper = app.wrapper
  return app
}

describe('ForgotPasswordPage', () => {
  it('resets a password in three steps and returns to sign-in', async () => {
    const sent = recordRequests()
    const app = await openReset()

    expect(heading()).toBe('Forgot your password?')
    expect(clean(document.body.textContent)).toContain('Step 1 of 3')

    await type('Email', ` ${OWNER.email} `)
    await submit()

    expect(heading()).toBe('Enter the code')
    expect(document.activeElement).toBe(document.querySelector('h1'))
    expect(clean(document.body.textContent)).toContain('Step 2 of 3')
    expect(clean(document.body.textContent)).toContain(`Check ${OWNER.email} for a 6-digit code.`)
    expect(statusText()).toBe(
      "If an account exists for this email, we've sent a 6-digit code to it.",
    )

    // Pasted with a space, as the email shows it.
    await type('6-digit code', '482 913')
    await submit()

    expect(heading()).toBe('Choose a new password')
    await type('New password', 'NewPass#2026')
    await type('Confirm new password', 'NewPass#2026')
    await submit()

    await vi.waitFor(() => {
      expect(app.router.currentRoute.value.fullPath).toBe('/garage/login?reason=reset')
      expect(alertText()).toBe('Your password has been reset. You can now sign in.')
    })
    expect(sent).toEqual([
      { url: `${API}/forgot-password`, email: OWNER.email },
      { url: `${API}/verify-otp`, email: OWNER.email, otp: RESET_CODE },
      { url: `${API}/reset-password`, token: RESET_TOKEN, new_password: 'NewPass#2026' },
    ])
    // The token never shows up in the address.
    expect(app.router.currentRoute.value.fullPath).not.toContain(RESET_TOKEN)
  })

  it('checks each step before calling the server', async () => {
    let calls = 0
    server.events.on('request:start', () => calls++)
    await openReset()

    await type('Email', 'not-an-email')
    await submit()
    expect(clean(document.body.textContent)).toContain('Enter a valid email address.')
    expect(calls).toBe(0)

    await type('Email', OWNER.email)
    await submit()
    calls = 0
    await type('6-digit code', '12345')
    await submit()
    expect(clean(document.body.textContent)).toContain('Enter the 6 digits from the email.')
    expect(calls).toBe(0)

    await type('6-digit code', RESET_CODE)
    await submit()
    calls = 0
    await type('New password', 'short')
    await type('Confirm new password', 'other')
    await submit()
    expect(clean(document.body.textContent)).toContain('Use at least 8 characters.')
    await type('New password', 'NewPass#2026')
    await submit()
    expect(clean(document.body.textContent)).toContain("The passwords don't match.")
    expect(calls).toBe(0)
  })

  it("shows the server's message for a wrong code and can send a new one", async () => {
    let codesSent = 0
    server.use(
      mock.post(`${API}/forgot-password`, () => {
        codesSent++
        return HttpResponse.json({ message: 'Sent.' })
      }),
    )
    await openReset()
    await type('Email', OWNER.email)
    await submit()

    await type('6-digit code', '000000')
    await submit()
    expect(alertText()).toBe('The code is incorrect.')
    expect(heading()).toBe('Enter the code')

    button('Send a new code').click()
    await flushPromises()
    await flushPromises()
    expect(codesSent).toBe(2)
    expect(alertText()).toBe('')
    expect(statusText()).toBe('A new code is on its way, if the last one is over a minute old.')
  })

  it('starts over when the reset session has expired', async () => {
    server.use(
      mock.post(`${API}/reset-password`, () =>
        nestError(400, 'Your password reset session has expired. Please start again.'),
      ),
    )
    await openReset()
    await type('Email', OWNER.email)
    await submit()
    await type('6-digit code', RESET_CODE)
    await submit()
    await type('New password', 'NewPass#2026')
    await type('Confirm new password', 'NewPass#2026')
    await submit()

    expect(alertText()).toBe('Your password reset session has expired. Please start again.')
    button('Start again').click()
    await flushPromises()
    expect(heading()).toBe('Forgot your password?')
    expect(alertText()).toBe('')
  })

  it('uses its own words when the server is unreachable', async () => {
    server.use(mock.post(`${API}/forgot-password`, () => HttpResponse.error()))
    await openReset('/admin/forgot-password')
    await type('Email', OWNER.email)
    await submit()

    expect(alertText()).toBe("Can't reach the server. Check your connection and try again.")
    expect(heading()).toBe('Forgot your password?')
  })

  it('links back to the sign-in page of its portal', async () => {
    await openReset('/admin/forgot-password')
    const back = [...document.querySelectorAll('a')].find(
      (a) => clean(a.textContent) === 'Back to sign in',
    )
    expect(back?.getAttribute('href')).toBe('/admin/login')
  })

  it('works in Kurdish, right to left', async () => {
    const app = await mountApp('/garage/forgot-password', { locale: 'ckb' })
    wrapper = app.wrapper

    expect(document.documentElement.dir).toBe('rtl')
    expect(heading()).toBe('وشەی نهێنیت بیرچووە؟')
    await type('ئیمەیڵ', OWNER.email)
    await submit()
    expect(heading()).toBe('کۆدەکە بنووسە')
    expect(clean(document.body.textContent)).toContain('هەنگاوی 2 لە 3')
  })
})
