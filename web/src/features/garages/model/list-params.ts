import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { GARAGE_STATUSES, type GarageStatus } from './garage.schemas'

/**
 * The Garages list state lives in the URL (?status=pending&q=erbil&page=2),
 * so it survives a reload, works with Back, and can be shared as a link.
 */
export interface GarageListParams {
  status: GarageStatus | undefined
  q: string
  page: number
}

export const PAGE_SIZE = 10
export const MAX_SEARCH_LENGTH = 100

const first = (value: LocationQuery[string] | undefined): string | undefined => {
  const item = Array.isArray(value) ? value[0] : value
  return typeof item === 'string' ? item : undefined
}

/** Anything odd in the URL falls back to the default instead of breaking the page. */
export function parseListParams(query: LocationQuery): GarageListParams {
  const status = first(query.status)
  const page = Number(first(query.page))
  return {
    status: (GARAGE_STATUSES as readonly string[]).includes(status ?? '')
      ? (status as GarageStatus)
      : undefined,
    q: (first(query.q) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

/** The URL query for `params`, leaving out defaults so links stay short. */
export function toRouteQuery(params: GarageListParams): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (params.status) query.status = params.status
  if (params.q) query.q = params.q
  if (params.page > 1) query.page = String(params.page)
  return query
}

/** The API query for `params`. */
export function toApiParams(params: GarageListParams): Record<string, string | number> {
  return {
    page: params.page,
    pageSize: PAGE_SIZE,
    ...(params.status && { status: params.status }),
    ...(params.q && { q: params.q }),
  }
}
