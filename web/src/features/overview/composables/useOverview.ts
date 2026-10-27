import { useQuery } from '@tanstack/vue-query'

import { overviewApi } from '../api/overview.api'

/** Query key for the cache. */
export const overviewKey = ['overview'] as const

/** The overview refreshes itself every minute while it's open, for today's figures. */
export function useOverview() {
  return useQuery({
    queryKey: overviewKey,
    queryFn: ({ signal }) => overviewApi.get(signal),
    refetchInterval: 60_000,
  })
}
