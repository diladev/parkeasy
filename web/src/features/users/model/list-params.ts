import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { firstQueryValue as first } from '@/shared/navigation/route-query'

import { ROLES, type Role } from './user.schemas'

/** The Users list state lives in the URL (?role=driver&q=aram&page=2), like Garages. */
export interface UserListParams {
  role: Role | undefined
  q: string
  page: number
}

export const PAGE_SIZE = 10
export const MAX_SEARCH_LENGTH = 100

/** Anything odd in the URL falls back to the default instead of breaking the page. */
export function parseListParams(query: LocationQuery): UserListParams {
  const role = first(query.role)
  const page = Number(first(query.page))
  return {
    role: (ROLES as readonly string[]).includes(role ?? '') ? (role as Role) : undefined,
    q: (first(query.q) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

/** The URL query for `params`, leaving out defaults so links stay short. */
export function toRouteQuery(params: UserListParams): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (params.role) query.role = params.role
  if (params.q) query.q = params.q
  if (params.page > 1) query.page = String(params.page)
  return query
}

/** The filters the API takes (the export uses these without paging). */
export function toFilterParams(params: UserListParams): Record<string, string> {
  return {
    ...(params.role && { role: params.role }),
    ...(params.q && { q: params.q }),
  }
}

/** The API query for one page of `params`. */
export function toApiParams(params: UserListParams): Record<string, string | number> {
  return { page: params.page, pageSize: PAGE_SIZE, ...toFilterParams(params) }
}
