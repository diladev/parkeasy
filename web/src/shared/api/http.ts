import axios, {
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { notifyLoggedOut } from '@/shared/auth/auth-channel'
import { tokenStore } from '@/shared/auth/token-store'
import { env } from '@/shared/config/env'

import { ApiError, toApiError } from './errors'

/** Rotates the httpOnly refresh cookie and returns a new access token. */
export const REFRESH_PATH = '/user/local/refresh'

/** A 401 from these means "wrong credentials", not "token expired": never refresh and retry. */
const NO_RETRY_PATHS: ReadonlySet<string> = new Set([
  '/user/local/login',
  '/user/local/register',
  REFRESH_PATH,
  '/user/local/forgot-password',
  '/user/local/verify-otp',
  '/user/local/reset-password',
])

let language = 'en'

/** The backend translates its messages from the x-lang header (en or ckb). */
export function setApiLanguage(lang: string): void {
  language = lang
}

const client = axios.create({
  baseURL: env.API_URL,
  // Sends the refresh cookie. It is SameSite=Strict, httpOnly and scoped to
  // /api/user/local, so other calls never carry it.
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  config.headers.set('x-lang', language)
  const token = tokenStore.get()
  // The refresh call authenticates with the cookie only.
  if (token && config.url !== REFRESH_PATH) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

let inFlight: Promise<string> | null = null

async function requestNewAccessToken(): Promise<string> {
  const { data } = await client.post<unknown>(REFRESH_PATH)
  const token = (data as { accessToken?: unknown } | null)?.accessToken
  if (typeof token !== 'string' || token === '') {
    throw new ApiError('server', '', {
      cause: new Error('The refresh response has no access token'),
    })
  }
  tokenStore.set(token)
  return token
}

function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  // Web Locks need a secure context (https or localhost); without them each tab
  // still refreshes at most once at a time.
  if (typeof navigator === 'undefined' || !('locks' in navigator)) return task()
  return navigator.locks.request('parkeasy-auth-refresh', task)
}

/**
 * Gets a new access token from the refresh cookie. Concurrent callers in this
 * tab share one request, and a Web Lock makes other tabs wait their turn. Both
 * matter because the backend accepts each refresh token only once: two refreshes
 * with the same cookie would sign the user out.
 */
export function refreshAccessToken(): Promise<string> {
  inFlight ??= withCrossTabLock(requestNewAccessToken).finally(() => {
    inFlight = null
  })
  return inFlight
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

client.interceptors.response.use(undefined, async (error: unknown) => {
  const apiError = toApiError(error)
  const config = isAxiosError(error) ? (error.config as RetriableConfig | undefined) : undefined

  const shouldRefresh =
    apiError.kind === 'auth' &&
    config !== undefined &&
    config._retried !== true &&
    !NO_RETRY_PATHS.has(config.url ?? '')
  if (!shouldRefresh) throw apiError

  const hadSession = tokenStore.get() !== null
  config._retried = true
  try {
    await refreshAccessToken()
  } catch {
    tokenStore.clear()
    // Only announce an ending if there was a session to end.
    if (hadSession) notifyLoggedOut('expired')
    throw apiError
  }
  // Replay once; the request interceptor adds the new token.
  return client.request(config)
})

/** Anything with a zod-style parse(): checks the response at runtime. */
export interface ResponseSchema<T> {
  parse: (data: unknown) => T
}

export type RequestOptions = Pick<AxiosRequestConfig, 'signal' | 'params'>

function parseBody<T>(schema: ResponseSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (cause) {
    // The backend answered with something we don't understand: a bug, not user error.
    throw new ApiError('server', '', { cause })
  }
}

/**
 * The only HTTP client. Feature api modules call these; components, stores and
 * guards never use axios or fetch directly. Every failure is an ApiError.
 */
export const http = {
  async get<T>(url: string, schema: ResponseSchema<T>, options?: RequestOptions): Promise<T> {
    const response = await client.get<unknown>(url, options)
    return parseBody(schema, response.data)
  },
  async post<T>(
    url: string,
    body: unknown,
    schema: ResponseSchema<T>,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await client.post<unknown>(url, body, options)
    return parseBody(schema, response.data)
  },
}
