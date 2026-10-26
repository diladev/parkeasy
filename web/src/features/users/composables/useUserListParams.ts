import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { parseListParams, toRouteQuery, type UserListParams } from '../model/list-params'

/** Reads and writes the Users list state in the URL. */
export function useUserListParams() {
  const route = useRoute()
  const router = useRouter()

  const params = computed(() => parseListParams(route.query))

  /** A new role or search starts again at page 1; `replace` is for typing in the search box. */
  function update(changes: Partial<UserListParams>, options: { replace?: boolean } = {}) {
    const next: UserListParams = { ...params.value, ...changes }
    if (changes.page === undefined && ('role' in changes || 'q' in changes)) next.page = 1
    const location = { query: toRouteQuery(next) }
    return options.replace ? router.replace(location) : router.push(location)
  }

  return { params, update }
}
