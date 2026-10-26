import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import { garagesApi } from '../api/garages.api'
import { garagesKeys } from '../api/garages.keys'

export function useGarage(id: MaybeRefOrGetter<number>) {
  return useQuery(() => ({
    queryKey: garagesKeys.detail(toValue(id)),
    queryFn: ({ signal }) => garagesApi.get(toValue(id), signal),
  }))
}
