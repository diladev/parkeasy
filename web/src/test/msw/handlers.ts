import { http, HttpResponse } from 'msw'

import { OWNER, garagePortalHandlers } from './garage-portal'
import { garageHandlers } from './garages'
import { overviewHandlers } from './overview'
import { userHandlers } from './users'

/** Mirrors the NestJS auth routes (backend/src/auth/auth.controller.ts) behind /api. */
export const API = '/api/user/local'

export const ADMIN = {
  email: 'admin@parkeasy.app',
  password: 'Demo@1234',
  me: {
    user: { id: 6, name: 'Dilan K.', email: 'admin@parkeasy.app' },
    role: 'admin',
    permissions: ['admin.access'],
  },
}

export const DRIVER_ME = {
  user: { id: 2, name: 'Aram', email: 'aram@example.com' },
  role: 'driver',
  permissions: [],
}

/** The password-reset code "emailed" to anyone in these tests. */
export const RESET_CODE = '482913'
export const RESET_TOKEN = 'reset-token'

let tokenCounter = 0
export const nextToken = (prefix = 'access'): string => `${prefix}-${++tokenCounter}`

export function sessionBody(accessToken = nextToken()) {
  return {
    accessToken,
    accessTokenExpiresIn: 900,
    refreshTokenExpiresIn: 604_800,
    user: ADMIN.me.user,
  }
}

const nestError = (statusCode: number, message: string | string[]) =>
  HttpResponse.json({ statusCode, message }, { status: statusCode })

/** Like the backend: each account signs in to its own portal only. */
const ACCOUNTS = [
  { ...ADMIN, portal: 'admin', tokenPrefix: 'access' },
  { ...OWNER, portal: 'garage', tokenPrefix: 'owner' },
]

/** Default happy-path handlers; tests override them with server.use(). */
export const handlers = [
  http.post(`${API}/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string; portal?: string }
    const account = ACCOUNTS.find((a) => a.email === body.email && a.password === body.password)
    if (!account) return nestError(401, 'Invalid email or password.')
    if (account.portal !== body.portal) return nestError(403, "This account can't sign in here.")
    return HttpResponse.json(sessionBody(nextToken(account.tokenPrefix)))
  }),
  // No refresh cookie by default: "not signed in".
  http.post(`${API}/refresh`, () => nestError(401, 'Your session has expired.')),
  http.get(`${API}/me`, ({ request }) => {
    const auth = request.headers.get('authorization') ?? ''
    if (!auth.startsWith('Bearer ')) return nestError(401, 'Unauthorized')
    return HttpResponse.json(auth.startsWith('Bearer owner-') ? OWNER.me : ADMIN.me)
  }),
  http.post(`${API}/logout`, () => HttpResponse.json({ message: 'Signed out.' })),

  http.post(`${API}/forgot-password`, () =>
    HttpResponse.json({
      message: "If an account exists for this email, we've sent a 6-digit code to it.",
    }),
  ),
  http.post(`${API}/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as { otp?: string }
    if (body.otp !== RESET_CODE) return nestError(400, 'The code is incorrect.')
    return HttpResponse.json({
      message: 'Code verified. You can now choose a new password.',
      token: RESET_TOKEN,
    })
  }),
  http.post(`${API}/reset-password`, async ({ request }) => {
    const body = (await request.json()) as { token?: string }
    if (body.token !== RESET_TOKEN) {
      return nestError(400, 'Your password reset session has expired. Please start again.')
    }
    return HttpResponse.json({ message: 'Your password has been reset. You can now sign in.' })
  }),

  ...garageHandlers,
  ...userHandlers,
  ...overviewHandlers,
  ...garagePortalHandlers,
]

export { nestError, OWNER }
