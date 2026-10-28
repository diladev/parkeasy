import { describe, expect, it } from 'vitest'

import { parseBookingParams, toBookingApiParams, toBookingQuery } from './bookings-params'

describe('parseBookingParams', () => {
  it('reads every filter from the URL', () => {
    expect(
      parseBookingParams({
        q: ' aram ',
        status: 'active',
        source: 'walk_in',
        period: '7d',
        page: '3',
      }),
    ).toEqual({ q: 'aram', status: 'active', source: 'walk_in', period: '7d', page: 3 })
  })

  it('falls back to the defaults for anything odd', () => {
    expect(
      parseBookingParams({ status: 'paid', source: 'phone', period: 'year', page: '-1' }),
    ).toEqual({ q: '', status: undefined, source: undefined, period: 'all', page: 1 })
  })
})

describe('toBookingQuery / toBookingApiParams', () => {
  const defaults = { q: '', status: undefined, source: undefined, period: 'all', page: 1 } as const

  it('leaves the defaults out of the URL and the request', () => {
    expect(toBookingQuery(defaults)).toEqual({})
    expect(toBookingApiParams(defaults)).toEqual({ page: 1, pageSize: 10 })
  })

  it('keeps the rest', () => {
    const params = {
      q: '22 SUL',
      status: 'completed',
      source: 'app',
      period: '30d',
      page: 2,
    } as const
    expect(toBookingQuery(params)).toEqual({
      q: '22 SUL',
      status: 'completed',
      source: 'app',
      period: '30d',
      page: '2',
    })
    expect(toBookingApiParams(params)).toEqual({
      page: 2,
      pageSize: 10,
      q: '22 SUL',
      status: 'completed',
      source: 'app',
      period: '30d',
    })
  })
})
