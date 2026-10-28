import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { BOOKING_SOURCES, BOOKING_STATUSES } from '@/shared/api/booking-row'
import { firstQueryValue as first } from '@/shared/navigation/route-query'

/** Started today, in the last 7 or 30 days (Iraq days, today included), or any time. */
export const BOOKING_PERIODS = ['today', '7d', '30d', 'all'] as const
export type BookingPeriod = (typeof BOOKING_PERIODS)[number]
export type BookingStatusFilter = (typeof BOOKING_STATUSES)[number]
export type BookingSourceFilter = (typeof BOOKING_SOURCES)[number]

/**
 * The Bookings page's state lives in the URL
 * (?status=active&source=walk_in&period=7d&q=aram&page=2), so it survives a
 * reload, works with Back, and can be shared as a link.
 */
export interface BookingListParams {
  q: string
  status: BookingStatusFilter | undefined
  source: BookingSourceFilter | undefined
  period: BookingPeriod
  page: number
}

export const PAGE_SIZE = 10
export const MAX_SEARCH_LENGTH = 100

const oneOf = <T extends string>(options: readonly T[], value: string | undefined) =>
  (options as readonly string[]).includes(value ?? '') ? (value as T) : undefined

/** Anything odd in the URL falls back to the default instead of breaking the page. */
export function parseBookingParams(query: LocationQuery): BookingListParams {
  const page = Number(first(query.page))
  return {
    q: (first(query.q) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    status: oneOf(BOOKING_STATUSES, first(query.status)),
    source: oneOf(BOOKING_SOURCES, first(query.source)),
    period: oneOf(BOOKING_PERIODS, first(query.period)) ?? 'all',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

/** The URL query for `params`, leaving out defaults so links stay short. */
export function toBookingQuery(params: BookingListParams): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (params.q) query.q = params.q
  if (params.status) query.status = params.status
  if (params.source) query.source = params.source
  if (params.period !== 'all') query.period = params.period
  if (params.page > 1) query.page = String(params.page)
  return query
}

/** The API query for `params`. */
export function toBookingApiParams(params: BookingListParams): Record<string, string | number> {
  return {
    page: params.page,
    pageSize: PAGE_SIZE,
    ...(params.q && { q: params.q }),
    ...(params.status && { status: params.status }),
    ...(params.source && { source: params.source }),
    ...(params.period !== 'all' && { period: params.period }),
  }
}
