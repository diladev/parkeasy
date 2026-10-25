import { isAxiosError, isCancel } from 'axios'

export type ApiErrorKind =
  | 'validation'
  | 'auth'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'server'
  | 'network'
  | 'cancelled'

/**
 * Every failed API call ends up as one of these, so components never look at
 * axios or at NestJS's error body directly.
 *
 * `message` is the server's message (already translated by the backend from the
 * x-lang header) for 4xx answers. For 5xx, network and cancelled errors it is
 * empty: show your own generic text instead of whatever the server said.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | undefined
  /** Every message from the body; NestJS validation sends an array. */
  readonly details: readonly string[]
  readonly requestId: string | undefined

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: {
      status?: number
      details?: readonly string[]
      requestId?: string
      cause?: unknown
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
    this.details = options.details ?? []
    this.requestId = options.requestId
  }
}

interface NestErrorBody {
  statusCode: number
  message: string | string[]
}

function isNestErrorBody(body: unknown): body is NestErrorBody {
  if (typeof body !== 'object' || body === null) return false
  const { statusCode, message } = body as Record<string, unknown>
  return (
    typeof statusCode === 'number' &&
    (typeof message === 'string' ||
      (Array.isArray(message) && message.every((m) => typeof m === 'string')))
  )
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return 'validation'
  if (status === 401) return 'auth'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not-found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rate-limit'
  return 'server'
}

/** Turns anything thrown by an API call into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isCancel(error)) return new ApiError('cancelled', '', { cause: error })
  if (!isAxiosError(error) || !error.response) {
    // No response at all: offline, DNS, CORS, timeout.
    return new ApiError('network', '', { cause: error })
  }

  const { status, data, headers } = error.response
  const kind = kindForStatus(status)
  const details = isNestErrorBody(data) ? ([] as string[]).concat(data.message) : []
  const requestIdHeader: unknown = headers['x-request-id']
  const requestId = typeof requestIdHeader === 'string' ? requestIdHeader : undefined

  return new ApiError(kind, kind === 'server' ? '' : (details[0] ?? ''), {
    status,
    details,
    requestId,
    cause: error,
  })
}
