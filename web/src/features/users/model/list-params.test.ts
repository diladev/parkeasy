import { describe, expect, it } from 'vitest'

import { parseListParams, toApiParams, toFilterParams, toRouteQuery } from './list-params'

describe('users list params', () => {
  it('reads the URL, ignoring anything it does not know', () => {
    expect(parseListParams({ role: 'garage_owner', q: ' aram ', page: '3' })).toEqual({
      role: 'garage_owner',
      q: 'aram',
      page: 3,
    })
    expect(parseListParams({ role: 'root', page: '-1', q: ['x', 'y'] })).toEqual({
      role: undefined,
      q: 'x',
      page: 1,
    })
    expect(parseListParams({ q: 'a'.repeat(150) }).q).toHaveLength(100)
  })

  it('writes short URLs and API queries', () => {
    const params = { role: 'driver' as const, q: 'lana', page: 1 }
    expect(toRouteQuery(params)).toEqual({ role: 'driver', q: 'lana' })
    expect(toRouteQuery({ role: undefined, q: '', page: 2 })).toEqual({ page: '2' })
    expect(toApiParams(params)).toEqual({ page: 1, pageSize: 10, role: 'driver', q: 'lana' })
    expect(toFilterParams({ role: undefined, q: '', page: 4 })).toEqual({})
  })
})
