import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { portalApi, portalKeys } from '../api/portal.api'

/** Occupancy and bookings move all day: refresh while the tab is open. */
const REFRESH_MS = 60_000

/** One garage's dashboard; waits until a garage is chosen. */
export function useDashboard(garageId: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: computed(() => portalKeys.dashboard(toValue(garageId) ?? 0)),
    queryFn: ({ signal }) => portalApi.dashboard(toValue(garageId) ?? 0, signal),
    enabled: computed(() => toValue(garageId) !== null),
    refetchInterval: REFRESH_MS,
    // Switching garages keeps the old figures on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  })
}
