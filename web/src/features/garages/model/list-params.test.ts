import { describe, expect, it } from 'vitest'

import { parseListParams, toApiParams, toRouteQuery } from './list-params'

describe('garage list params', () => {
  it('reads a clean URL', () => {
    expect(parseListParams({ status: 'pending', q: ' erbil ', page: '3' })).toEqual({
      status: 'pending',
      q: 'erbil',
      page: 3,
    })
  })

  it.each([
    [{ status: 'deleted' }, { status: undefined }],
    [{ page: '0' }, { page: 1 }],
    [{ page: '-2' }, { page: 1 }],
    [{ page: '2.5' }, { page: 1 }],
    [{ page: 'abc' }, { page: 1 }],
    [{ q: ['a', 'b'] }, { q: 'a' }],
    [{ q: 'x'.repeat(150) }, { q: 'x'.repeat(100) }],
  ])('falls back on a broken URL value %j', (query, expected) => {
    expect(parseListParams(query)).toMatchObject(expected)
  })

  it('writes short URLs without defaults', () => {
    expect(toRouteQuery({ status: undefined, q: '', page: 1 })).toEqual({})
    expect(toRouteQuery({ status: 'suspended', q: 'zagros', page: 2 })).toEqual({
      status: 'suspended',
      q: 'zagros',
      page: '2',
    })
  })

  it('asks the API for one page of ten', () => {
    expect(toApiParams({ status: undefined, q: '', page: 1 })).toEqual({ page: 1, pageSize: 10 })
    expect(toApiParams({ status: 'pending', q: 'erbil', page: 2 })).toEqual({
      page: 2,
      pageSize: 10,
      status: 'pending',
      q: 'erbil',
    })
  })
})
