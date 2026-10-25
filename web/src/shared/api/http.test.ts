import { http as mock, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { API, nestError, sessionBody } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { onLoggedOut, type LogoutReason } from '@/shared/auth/auth-channel'
import { tokenStore } from '@/shared/auth/token-store'

import { ApiError } from './errors'
import { http, refreshAccessToken, setApiLanguage } from './http'

const ok = z.object({ ok: z.literal(true) })
const PROTECTED = '/user/local/me'

/** A protected endpoint that only accepts the given token. */
function protectedRoute(acceptedToken: string, seen: (string | null)[] = []) {
  return mock.get(`${API}/me`, ({ request }) => {
    const auth = request.headers.get('authorization')
    seen.push(auth)
    return auth === `Bearer ${acceptedToken}`
      ? HttpResponse.json({ ok: true })
      : nestError(401, 'Unauthorized')
  })
}

function countRefreshes(next = () => HttpResponse.json(sessionBody('fresh'))) {
  const calls = { count: 0, authHeaders: [] as (string | null)[] }
  server.use(
    mock.post(`${API}/refresh`, ({ request }) => {
      calls.count++
      calls.authHeaders.push(request.headers.get('authorization'))
      return next()
    }),
  )
  return calls
}

describe('http', () => {
  let logouts: LogoutReason[]
  let stopListening: () => void

  beforeEach(() => {
    logouts = []
    stopListening = onLoggedOut((reason) => logouts.push(reason))
  })
  afterEach(() => {
    stopListening()
    setApiLanguage('en')
  })

  it('sends the access token and the language', async () => {
    let headers: Headers | undefined
    server.use(
      mock.get(`${API}/me`, ({ request }) => {
        headers = request.headers
        return HttpResponse.json({ ok: true })
      }),
    )
    tokenStore.set('abc')
    setApiLanguage('ckb')

    await http.get(PROTECTED, ok)

    expect(headers?.get('authorization')).toBe('Bearer abc')
    expect(headers?.get('x-lang')).toBe('ckb')
  })

  it('refreshes once on 401 and replays the request with the new token', async () => {
    const seen: (string | null)[] = []
    server.use(protectedRoute('fresh', seen))
    const refreshes = countRefreshes()
    tokenStore.set('expired')

    await expect(http.get(PROTECTED, ok)).resolves.toEqual({ ok: true })

    expect(refreshes.count).toBe(1)
    expect(seen).toEqual(['Bearer expired', 'Bearer fresh'])
    expect(tokenStore.get()).toBe('fresh')
    // The refresh call proves itself with the cookie, never with the old token.
    expect(refreshes.authHeaders).toEqual([null])
  })

  it('shares one refresh between requests that fail together', async () => {
    server.use(protectedRoute('fresh'))
    const refreshes = countRefreshes()
    tokenStore.set('expired')

    await Promise.all([http.get(PROTECTED, ok), http.get(PROTECTED, ok), http.get(PROTECTED, ok)])

    expect(refreshes.count).toBe(1)
  })

  it('takes a Web Lock so other tabs never refresh at the same time', async () => {
    const request = vi.fn<(name: string, task: () => Promise<unknown>) => Promise<unknown>>(
      (_name, task) => task(),
    )
    vi.stubGlobal('navigator', { ...navigator, locks: { request } })
    countRefreshes()

    await refreshAccessToken()

    expect(request).toHaveBeenCalledWith('parkeasy-auth-refresh', expect.any(Function))
  })

  it('signs out everywhere when the session cannot be refreshed', async () => {
    server.use(protectedRoute('fresh'))
    countRefreshes(() => nestError(401, 'Your session has expired.'))
    tokenStore.set('expired')

    const error: unknown = await http.get(PROTECTED, ok).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).kind).toBe('auth')
    expect(tokenStore.get()).toBeNull()
    expect(logouts).toEqual(['expired'])
  })

  it('does not announce an expiry when nobody was signed in', async () => {
    server.use(protectedRoute('fresh'))
    countRefreshes(() => nestError(401, 'Your session has expired.'))

    await expect(http.get(PROTECTED, ok)).rejects.toBeInstanceOf(ApiError)
    expect(logouts).toEqual([])
  })

  it('never refreshes after a failed sign-in (wrong password is not an expired token)', async () => {
    const refreshes = countRefreshes()

    const error: unknown = await http
      .post('/user/local/login', { email: 'a@b.c', password: 'nope' }, ok)
      .catch((e: unknown) => e)

    expect((error as ApiError).message).toBe('Invalid email or password.')
    expect(refreshes.count).toBe(0)
  })

  it('retries only once', async () => {
    server.use(protectedRoute('never-valid'))
    const refreshes = countRefreshes()
    tokenStore.set('expired')

    await expect(http.get(PROTECTED, ok)).rejects.toMatchObject({ kind: 'auth' })
    expect(refreshes.count).toBe(1)
  })

  it('rejects a response that does not match the expected shape', async () => {
    server.use(mock.get(`${API}/me`, () => HttpResponse.json({ ok: 'yes' })))

    await expect(http.get(PROTECTED, ok)).rejects.toMatchObject({ kind: 'server', message: '' })
  })
})
