import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import { usersApi } from '../api/users.api'
import { usersKeys } from '../api/users.keys'
import type { UserListParams } from '../model/list-params'

/** One page of users. The previous page stays on screen while the next one loads. */
export function useUsers(params: MaybeRefOrGetter<UserListParams>) {
  return useQuery(() => ({
    queryKey: usersKeys.list(toValue(params)),
    queryFn: ({ signal }) => usersApi.list(toValue(params), signal),
    placeholderData: keepPreviousData,
  }))
}
