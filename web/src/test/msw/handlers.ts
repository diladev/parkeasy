import { http, HttpResponse } from 'msw'

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

let tokenCounter = 0
export const nextToken = (): string => `access-${++tokenCounter}`

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

/** Default happy-path handlers; tests override them with server.use(). */
export const handlers = [
  http.post(`${API}/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email !== ADMIN.email || body.password !== ADMIN.password) {
      return nestError(401, 'Invalid email or password.')
    }
    return HttpResponse.json(sessionBody())
  }),
  // No refresh cookie by default: "not signed in".
  http.post(`${API}/refresh`, () => nestError(401, 'Your session has expired.')),
  http.get(`${API}/me`, ({ request }) =>
    request.headers.get('authorization')?.startsWith('Bearer ')
      ? HttpResponse.json(ADMIN.me)
      : nestError(401, 'Unauthorized'),
  ),
  http.post(`${API}/logout`, () => HttpResponse.json({ message: 'Signed out.' })),
  ...garageHandlers,
  ...userHandlers,
  ...overviewHandlers,
]

export { nestError }
