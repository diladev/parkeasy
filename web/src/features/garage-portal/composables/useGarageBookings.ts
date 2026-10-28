import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { portalApi, portalKeys } from '../api/portal.api'
import {
  parseBookingParams,
  toBookingQuery,
  type BookingListParams,
} from '../model/bookings-params'

/** Reads and writes the Bookings page's filters in the URL. */
export function useBookingParams() {
  const route = useRoute()
  const router = useRouter()
  const params = computed(() => parseBookingParams(route.query))

  /**
   * Any new filter or search starts again at page 1. `replace` is for typing
   * in the search box, so Back doesn't step through every letter.
   */
  function update(changes: Partial<BookingListParams>, options: { replace?: boolean } = {}) {
    const next: BookingListParams = { ...params.value, ...changes }
    if (changes.page === undefined) next.page = 1
    const location = { query: toBookingQuery(next) }
    return options.replace ? router.replace(location) : router.push(location)
  }

  return { params, update }
}

/** One page of a garage's bookings. The previous page stays on screen while the next one loads. */
export function useGarageBookings(
  garageId: MaybeRefOrGetter<number | null>,
  params: MaybeRefOrGetter<BookingListParams>,
) {
  return useQuery(() => ({
    queryKey: portalKeys.bookings(toValue(garageId) ?? 0, toValue(params)),
    queryFn: ({ signal }) => portalApi.bookings(toValue(garageId) ?? 0, toValue(params), signal),
    enabled: toValue(garageId) !== null,
    placeholderData: keepPreviousData,
  }))
}
