import { useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import { usersApi } from '../api/users.api'
import { usersKeys } from '../api/users.keys'

export function useUser(id: MaybeRefOrGetter<number>) {
  return useQuery(() => ({
    queryKey: usersKeys.detail(toValue(id)),
    queryFn: ({ signal }) => usersApi.get(toValue(id), signal),
  }))
}
