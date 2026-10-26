import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import { garagesApi } from '../api/garages.api'
import { garagesKeys } from '../api/garages.keys'
import type { GarageListParams } from '../model/list-params'

/** One page of garages. The previous page stays on screen while the next one loads. */
export function useGarages(params: MaybeRefOrGetter<GarageListParams>) {
  return useQuery(() => ({
    queryKey: garagesKeys.list(toValue(params)),
    queryFn: ({ signal }) => garagesApi.list(toValue(params), signal),
    placeholderData: keepPreviousData,
  }))
}
