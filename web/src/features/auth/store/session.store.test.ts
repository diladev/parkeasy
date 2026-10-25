import { http as mock, HttpResponse } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { onLoggedOut, type LogoutReason } from '@/shared/auth/auth-channel'
import { tokenStore } from '@/shared/auth/token-store'
import { ADMIN, API, nestError, sessionBody } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'

import { useSessionStore } from './session.store'

describe('session store', () => {
  let logouts: LogoutReason[]
  let stopListening: () => void

  beforeEach(() => {
    setActivePinia(createPinia())
    logouts = []
    stopListening = onLoggedOut((reason) => logouts.push(reason))
  })
  afterEach(() => stopListening())

  it('signs in, keeps the token in memory and loads permissions from /me', async () => {
    const session = useSessionStore()
    let portal: unknown
    server.use(
      mock.post(`${API}/login`, async ({ request }) => {
        portal = ((await request.json()) as { portal?: unknown }).portal
        return HttpResponse.json(sessionBody('t1'))
      }),
    )

    await session.login({ email: ADMIN.email, password: ADMIN.password }, 'admin')

    expect(portal).toBe('admin')
    expect(tokenStore.get()).toBe('t1')
    expect(session.isAuthenticated).toBe(true)
    expect(session.user?.name).toBe('Dilan K.')
    expect(session.permissions.has('admin.access')).toBe(true)
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it('passes the server error through when sign-in is refused', async () => {
    const session = useSessionStore()
    server.use(mock.post(`${API}/login`, () => nestError(403, "This account can't sign in here.")))

    await expect(
      session.login({ email: 'aram@example.com', password: 'x' }, 'admin'),
    ).rejects.toMatchObject({ kind: 'forbidden', message: "This account can't sign in here." })
    expect(session.isAuthenticated).toBe(false)
    expect(tokenStore.get()).toBeNull()
  })

  it('restores the session from the refresh cookie after a reload', async () => {
    const session = useSessionStore()
    server.use(mock.post(`${API}/refresh`, () => HttpResponse.json(sessionBody('restored'))))

    await expect(session.restore()).resolves.toBe(true)

    expect(tokenStore.get()).toBe('restored')
    expect(session.role).toBe('admin')
  })

  it('starts signed out when there is no valid cookie', async () => {
    const session = useSessionStore()

    await expect(session.restore()).resolves.toBe(false)

    expect(session.isAuthenticated).toBe(false)
    expect(logouts).toEqual([])
  })

  it('signs out on the server and in every tab', async () => {
    const session = useSessionStore()
    await session.login({ email: ADMIN.email, password: ADMIN.password }, 'admin')
    let logoutAuth: string | null = null
    server.use(
      mock.post(`${API}/logout`, ({ request }) => {
        logoutAuth = request.headers.get('authorization')
        return HttpResponse.json({ message: 'Signed out.' })
      }),
    )

    await session.logout()

    expect(logoutAuth).toMatch(/^Bearer /)
    expect(session.isAuthenticated).toBe(false)
    expect(tokenStore.get()).toBeNull()
    expect(logouts).toEqual(['signed-out'])
  })

  it('still signs out locally when the server is unreachable', async () => {
    const session = useSessionStore()
    await session.login({ email: ADMIN.email, password: ADMIN.password }, 'admin')
    server.use(mock.post(`${API}/logout`, () => HttpResponse.error()))

    await session.logout()

    expect(session.isAuthenticated).toBe(false)
    expect(logouts).toEqual(['signed-out'])
  })
})
