import { AxiosError, AxiosHeaders, CanceledError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'

import { ApiError, toApiError } from './errors'

function responseError(status: number, data: unknown, headers: Record<string, string> = {}) {
  const config = { headers: new AxiosHeaders() }
  const response: AxiosResponse = {
    status,
    statusText: '',
    data,
    headers,
    config,
  }
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response)
}

describe('toApiError', () => {
  it.each([
    [400, 'validation'],
    [401, 'auth'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [409, 'conflict'],
    [422, 'validation'],
    [429, 'rate-limit'],
    [500, 'server'],
    [503, 'server'],
  ])('maps HTTP %i to %s', (status, kind) => {
    expect(toApiError(responseError(status, null)).kind).toBe(kind)
  })

  it("keeps the server's (translated) message and every validation message", () => {
    const error = toApiError(
      responseError(400, {
        statusCode: 400,
        message: ['Email is required', 'Password is too short'],
      }),
    )
    expect(error.message).toBe('Email is required')
    expect(error.details).toEqual(['Email is required', 'Password is too short'])
    expect(error.status).toBe(400)
  })

  it('never shows a 5xx message to users', () => {
    const error = toApiError(
      responseError(500, { statusCode: 500, message: 'relation "users" does not exist' }),
    )
    expect(error.kind).toBe('server')
    expect(error.message).toBe('')
  })

  it('reads the request id for support', () => {
    expect(toApiError(responseError(500, null, { 'x-request-id': 'req-42' })).requestId).toBe(
      'req-42',
    )
  })

  it('ignores bodies that are not NestJS errors', () => {
    expect(toApiError(responseError(400, '<html>Bad gateway</html>')).message).toBe('')
  })

  it('treats a missing response as a network error', () => {
    expect(toApiError(new AxiosError('Network Error', 'ERR_NETWORK')).kind).toBe('network')
    expect(toApiError(new Error('boom')).kind).toBe('network')
  })

  it('recognises cancelled requests and passes ApiErrors through', () => {
    expect(toApiError(new CanceledError()).kind).toBe('cancelled')
    const original = new ApiError('forbidden', 'No')
    expect(toApiError(original)).toBe(original)
  })
})
